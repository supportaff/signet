import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";
import type { SslCheckResult, SslCheckStatus } from "@/lib/ssl-check-types";

export type { SslCheckResult, SslCheckStatus };

export class SslCheckError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "SslCheckError";
  }
}

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata.google.internal",
  "kubernetes",
  "kubernetes.default",
  "kubernetes.default.svc",
]);

const BLOCKED_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".lan",
  ".home",
  ".corp",
  ".intranet",
  ".private",
  ".localdomain",
];

const HANDSHAKE_MS = 8000;

export function parseTarget(input: string): { hostname: string; port: number } {
  const trimmed = input.trim();
  if (!trimmed) throw new SslCheckError(400, "Enter a hostname or URL.");
  if (trimmed.length > 2048) throw new SslCheckError(400, "That URL is too long.");
  if (/[\s<>\\]/.test(trimmed)) throw new SslCheckError(400, "Enter a valid hostname or URL.");

  let url: URL;
  try {
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed);
    url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
  } catch {
    throw new SslCheckError(400, "Enter a valid hostname or URL, like example.com.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new SslCheckError(400, "Only website URLs are supported.");
  }
  if (url.username || url.password) {
    throw new SslCheckError(400, "URLs with credentials are not allowed.");
  }

  const hostname = url.hostname.replace(/\.+$/, "").toLowerCase();
  if (!hostname) throw new SslCheckError(400, "Enter a valid hostname.");

  const port = url.port ? Number(url.port) : 443;
  if (!Number.isInteger(port) || port !== 443) {
    throw new SslCheckError(400, "Only port 443 (HTTPS) is supported.");
  }

  return { hostname, port };
}

export function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isBlockedV4(ip);
  if (net.isIPv6(ip)) return isBlockedV6(ip);
  return true;
}

export function assertAllowedHost(hostname: string) {
  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new SslCheckError(400, "Private and reserved addresses are not allowed.");
    }
    return;
  }

  if (BLOCKED_HOSTS.has(hostname) || BLOCKED_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    throw new SslCheckError(400, "That hostname is not allowed.");
  }
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(hostname)) {
    throw new SslCheckError(400, "Enter a public hostname, like example.com.");
  }
}

function isBlockedV4(ip: string): boolean {
  const [a, b, c] = ip.split(".").map(Number);
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224) return true;
  return false;
}

function isBlockedV6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("ff")) return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("2001:db8:")) return true;
  if (lower.startsWith("::ffff:")) {
    const mapped = lower.slice("::ffff:".length);
    return net.isIPv4(mapped) ? isBlockedV4(mapped) : true;
  }
  return false;
}

export async function resolvePublicHttpsTarget(input: string) {
  const target = parseTarget(input);
  assertAllowedHost(target.hostname);

  let ip: string;
  if (net.isIP(target.hostname)) {
    ip = target.hostname;
  } else {
    const records = await dns.lookup(target.hostname, { all: true }).catch(() => {
      throw new SslCheckError(400, "That hostname did not resolve.");
    });
    const publicRecords = records.filter((record) => !isBlockedIp(record.address));
    if (!publicRecords.length) {
      throw new SslCheckError(400, "That host resolves to a private or reserved address.");
    }
    ip = (publicRecords.find((record) => record.family === 4) ?? publicRecords[0]).address;
  }

  return { ...target, ip, input: input.trim() };
}

export async function checkRemoteCertificate(input: string): Promise<SslCheckResult> {
  return connectAndRead(await resolvePublicHttpsTarget(input));
}

function connectAndRead(opts: {
  hostname: string;
  port: number;
  ip: string;
  input: string;
}): Promise<SslCheckResult> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: opts.ip,
      port: opts.port,
      servername: net.isIP(opts.hostname) ? undefined : opts.hostname,
      rejectUnauthorized: false,
      ALPNProtocols: ["http/1.1"],
    });

    const fail = (error: SslCheckError) => {
      socket.destroy();
      reject(error);
    };

    const timer = setTimeout(() => {
      fail(new SslCheckError(504, "The TLS handshake timed out."));
    }, HANDSHAKE_MS);

    socket.setTimeout(HANDSHAKE_MS);

    socket.once("timeout", () => {
      clearTimeout(timer);
      fail(new SslCheckError(504, "The connection timed out."));
    });

    socket.once("error", () => {
      clearTimeout(timer);
      fail(new SslCheckError(502, `Could not complete a TLS handshake with ${opts.hostname}.`));
    });

    socket.once("secureConnect", () => {
      clearTimeout(timer);
      try {
        const peer = socket.getPeerCertificate(true);
        if (!peer || !Object.keys(peer).length) {
          fail(new SslCheckError(502, "The server did not present a certificate."));
          return;
        }
        const result = toResult({
          input: opts.input,
          hostname: opts.hostname,
          port: opts.port,
          ip: opts.ip,
          peer,
          protocol: socket.getProtocol(),
          cipher: socket.getCipher()?.name ?? null,
          authorized: socket.authorized,
          authorizationError: socket.authorizationError
            ? String(socket.authorizationError)
            : null,
        });
        socket.end();
        resolve(result);
      } catch {
        fail(new SslCheckError(502, "Could not read the presented certificate."));
      }
    });
  });
}

function toResult(args: {
  input: string;
  hostname: string;
  port: number;
  ip: string;
  peer: tls.DetailedPeerCertificate;
  protocol: string | null;
  cipher: string | null;
  authorized: boolean;
  authorizationError: string | null;
}): SslCheckResult {
  const notBefore = new Date(args.peer.valid_from);
  const notAfter = new Date(args.peer.valid_to);
  const now = Date.now();
  const daysRemaining = Math.floor((notAfter.getTime() - now) / 86_400_000);
  const sans = parseSans(args.peer.subjectaltname);
  const hostnameMatches = namesMatchHost(args.hostname, args.peer);
  const status = resolveStatus({
    now,
    notBefore,
    notAfter,
    daysRemaining,
    authorized: args.authorized,
  });

  return {
    ok: true,
    status,
    statusLabel: statusLabel(status),
    hostnameMatches,
    trustedByPublicCas: args.authorized,
    authorizationError: args.authorizationError,
    protocol: args.protocol,
    cipher: args.cipher,
    host: {
      input: args.input,
      hostname: args.hostname,
      port: args.port,
      ip: args.ip,
    },
    certificate: {
      subject: formatDn(args.peer.subject),
      commonName: firstValue(args.peer.subject.CN),
      issuer: formatDn(args.peer.issuer),
      issuerCommonName: firstValue(args.peer.issuer.CN),
      serial: args.peer.serialNumber,
      notBefore: notBefore.toISOString(),
      notAfter: notAfter.toISOString(),
      daysRemaining,
      sans,
      fingerprintSha1: colonize(args.peer.fingerprint),
      fingerprintSha256: colonize(args.peer.fingerprint256),
      pem: derToPem(args.peer.raw),
    },
    chain: collectChain(args.peer),
  };
}

function resolveStatus(args: {
  now: number;
  notBefore: Date;
  notAfter: Date;
  daysRemaining: number;
  authorized: boolean;
}): SslCheckStatus {
  if (args.now < args.notBefore.getTime()) return "not_yet_valid";
  if (args.now > args.notAfter.getTime()) return "expired";
  if (args.daysRemaining <= 30) return "expiring";
  if (!args.authorized) return "untrusted";
  return "valid";
}

function statusLabel(status: SslCheckStatus) {
  switch (status) {
    case "valid":
      return "Valid";
    case "expiring":
      return "Expiring soon";
    case "expired":
      return "Expired";
    case "not_yet_valid":
      return "Not yet valid";
    case "untrusted":
      return "Not publicly trusted";
  }
}

function parseSans(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim().replace(/^(DNS|IP Address|email|URI):/i, "").trim())
    .filter(Boolean);
}

function namesMatchHost(hostname: string, cert: tls.PeerCertificate): boolean {
  if (net.isIP(hostname)) {
    return parseSans(cert.subjectaltname).some((name) => name.toLowerCase() === hostname.toLowerCase());
  }
  const names = [
    ...parseSans(cert.subjectaltname),
    firstValue(cert.subject.CN) ?? "",
  ]
    .map((name) => name.toLowerCase())
    .filter(Boolean);

  return names.some((name) => {
    if (name === hostname) return true;
    if (!name.startsWith("*.")) return false;
    const suffix = name.slice(1);
    const hostLabels = hostname.split(".");
    const wildLabels = name.split(".");
    return hostname.endsWith(suffix) && hostLabels.length === wildLabels.length;
  });
}

function formatDn(dn: tls.PeerCertificate["subject"] | tls.PeerCertificate["issuer"]): string {
  return Object.entries(dn)
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join("+") : value}`)
    .join(", ");
}

function firstValue(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function colonize(value: string): string {
  return value.includes(":") ? value.toUpperCase() : value.toUpperCase().match(/.{2}/g)?.join(":") ?? value;
}

function derToPem(raw: Buffer): string {
  const body = raw.toString("base64").match(/.{1,64}/g)?.join("\n") ?? "";
  return `-----BEGIN CERTIFICATE-----\n${body}\n-----END CERTIFICATE-----`;
}

function collectChain(leaf: tls.DetailedPeerCertificate) {
  const chain: { subject: string; issuer: string; notAfter: string }[] = [];
  const seen = new Set<string>();
  let current: tls.DetailedPeerCertificate | undefined = leaf;

  while (current && current.fingerprint256 && !seen.has(current.fingerprint256)) {
    seen.add(current.fingerprint256);
    chain.push({
      subject: formatDn(current.subject),
      issuer: formatDn(current.issuer),
      notAfter: new Date(current.valid_to).toISOString(),
    });
    const next: tls.DetailedPeerCertificate | undefined = current.issuerCertificate;
    if (!next || next === current || next.fingerprint256 === current.fingerprint256) break;
    current = next;
  }

  return chain;
}
