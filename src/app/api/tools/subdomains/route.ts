import { NextResponse } from "next/server";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import { SslCheckError } from "@/lib/ssl-check";
import { findSubdomains } from "@/lib/subdomains";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function POST(request: Request) {
  if (!allowRequest(clientIp(request), 4, 60_000)) {
    return NextResponse.json({ error: "Too many lookups. Wait a minute and try again." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { domain?: string; url?: string } | null;
  try {
    return NextResponse.json(await findSubdomains(body?.domain || body?.url || ""));
  } catch (error) {
    if (error instanceof SslCheckError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not look up subdomains." }, { status: 502 });
  }
}
