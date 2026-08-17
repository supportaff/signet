import { NextResponse } from "next/server";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import { assertAllowedHost, SslCheckError } from "@/lib/ssl-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(request: Request) {
  if (!allowRequest(clientIp(request), 6, 60_000)) {
    return NextResponse.json({ error: "Too many lookups. Wait a minute and try again." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { domain?: string } | null;
  const domain = (body?.domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0] || "";
  try {
    assertAllowedHost(domain);
  } catch (error) {
    if (error instanceof SslCheckError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Enter a public domain." }, { status: 400 });
  }

  const response = await fetch(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`, {
    headers: { Accept: "application/json", "User-Agent": "SelfSignedCert/1.0" },
  }).catch(() => null);
  if (!response?.ok) {
    return NextResponse.json({ error: "Certificate Transparency lookup is unavailable right now." }, { status: 502 });
  }
  const rows = (await response.json().catch(() => [])) as Array<{
    common_name?: string;
    name_value?: string;
    issuer_name?: string;
    not_before?: string;
    not_after?: string;
    id?: number;
  }>;
  const seen = new Set<string>();
  const entries = [];
  for (const row of rows) {
    const key = `${row.common_name}|${row.not_before}|${row.issuer_name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({
      id: row.id,
      commonName: row.common_name || "",
      names: (row.name_value || "").split("\n").slice(0, 6),
      issuer: row.issuer_name || "",
      notBefore: row.not_before || "",
      notAfter: row.not_after || "",
    });
    if (entries.length >= 25) break;
  }
  return NextResponse.json({ domain, count: entries.length, entries });
}
