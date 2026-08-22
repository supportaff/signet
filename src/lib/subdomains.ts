import dns from "node:dns/promises";
import { assertAllowedHost, isBlockedIp, parseHostname, SslCheckError } from "@/lib/ssl-check";

const COMMON = ["www", "mail", "api", "app", "staging", "dev", "vpn", "admin", "portal", "cdn"];

type CrtRow = { common_name?: string; name_value?: string };

function namesFromRow(row: CrtRow) {
  return `${row.common_name || ""}\n${row.name_value || ""}`
    .split(/[\n,]/)
    .map((name) => name.trim().toLowerCase().replace(/^\*\./, ""))
    .filter(Boolean);
}

function belongsTo(name: string, domain: string) {
  return name === domain || name.endsWith(`.${domain}`);
}

async function fetchCrt(query: string) {
  const response = await fetch(`https://crt.sh/?q=${encodeURIComponent(query)}&output=json`, {
    headers: { Accept: "application/json", "User-Agent": "SelfSignedCert/1.0" },
  }).catch(() => null);
  if (!response?.ok) return [] as CrtRow[];
  const rows = (await response.json().catch(() => [])) as CrtRow[];
  return Array.isArray(rows) ? rows : [];
}

export async function findSubdomains(input: string) {
  const domain = parseHostname(input);
  assertAllowedHost(domain);
  if (domain.split(".").length < 2) {
    throw new SslCheckError(400, "Enter a public domain, like example.com.");
  }

  const [exact, wildcard] = await Promise.all([fetchCrt(domain), fetchCrt(`%.${domain}`)]);
  const found = new Set<string>();
  for (const row of [...exact, ...wildcard]) {
    for (const name of namesFromRow(row)) {
      if (belongsTo(name, domain) && name.length < 253) found.add(name);
    }
  }

  const resolved: { host: string; ip: string | null; source: "ct" | "dns" }[] = [...found]
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 100)
    .map((host) => ({ host, ip: null, source: "ct" as const }));

  const extra = await Promise.all(
    COMMON.map(async (prefix) => {
      const host = `${prefix}.${domain}`;
      if (found.has(host)) return null;
      const records = await dns.lookup(host, { all: true }).catch(() => []);
      const publicRecords = records.filter((record) => !isBlockedIp(record.address));
      if (!publicRecords.length) return null;
      return { host, ip: publicRecords[0].address, source: "dns" as const };
    }),
  );
  for (const row of extra) {
    if (row) resolved.push(row);
  }

  return {
    domain,
    count: resolved.length,
    hosts: resolved,
  };
}
