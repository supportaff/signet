import https from "node:https";
import { resolvePublicHttpsTarget, SslCheckError } from "@/lib/ssl-check";

export interface HeaderCheck {
  ok: true;
  host: { hostname: string; ip: string };
  status: number;
  headers: Record<string, string>;
  findings: { name: string; ok: boolean; detail: string }[];
}

export async function checkSecurityHeaders(input: string): Promise<HeaderCheck> {
  const target = await resolvePublicHttpsTarget(input);
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        host: target.ip,
        port: 443,
        method: "HEAD",
        path: "/",
        servername: target.hostname,
        headers: { Host: target.hostname, "User-Agent": "SelfSignedCert-header-check/1.0" },
        timeout: 8000,
        rejectUnauthorized: false,
      },
      (response) => {
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(response.headers)) {
          if (typeof value === "string") headers[key.toLowerCase()] = value;
          else if (Array.isArray(value)) headers[key.toLowerCase()] = value.join(", ");
        }
        request.destroy();
        resolve({
          ok: true,
          host: { hostname: target.hostname, ip: target.ip },
          status: response.statusCode || 0,
          headers,
          findings: findingsFrom(headers),
        });
      },
    );
    request.on("timeout", () => {
      request.destroy();
      reject(new SslCheckError(504, "The header check timed out."));
    });
    request.on("error", () => {
      reject(new SslCheckError(502, `Could not read headers from ${target.hostname}.`));
    });
    request.end();
  });
}

function findingsFrom(headers: Record<string, string>) {
  const hsts = headers["strict-transport-security"] || "";
  const csp = headers["content-security-policy"] || "";
  const xfo = headers["x-frame-options"] || "";
  const xcto = headers["x-content-type-options"] || "";
  const referrer = headers["referrer-policy"] || "";
  const permissions = headers["permissions-policy"] || headers["feature-policy"] || "";
  return [
    {
      name: "Strict-Transport-Security",
      ok: /max-age=\d+/i.test(hsts) && Number(hsts.match(/max-age=(\d+)/i)?.[1] || 0) >= 15552000,
      detail: hsts || "Missing. Browsers will not force HTTPS on return visits.",
    },
    {
      name: "Content-Security-Policy",
      ok: Boolean(csp),
      detail: csp || "Missing. A CSP reduces XSS blast radius.",
    },
    {
      name: "X-Frame-Options",
      ok: /deny|sameorigin/i.test(xfo) || /frame-ancestors/i.test(csp),
      detail: xfo || (csp.includes("frame-ancestors") ? "Covered by CSP frame-ancestors." : "Missing clickjacking control."),
    },
    {
      name: "X-Content-Type-Options",
      ok: xcto.toLowerCase() === "nosniff",
      detail: xcto || "Missing nosniff.",
    },
    {
      name: "Referrer-Policy",
      ok: Boolean(referrer),
      detail: referrer || "Missing. Browsers may leak full URLs to third parties.",
    },
    {
      name: "Permissions-Policy",
      ok: Boolean(permissions),
      detail: permissions || "Missing. Camera, mic, and geo stay at browser defaults.",
    },
  ];
}
