import { NextResponse } from "next/server";
import { lookupCaa } from "@/lib/caa";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import { SslCheckError } from "@/lib/ssl-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(request: Request) {
  if (!allowRequest(clientIp(request), 8, 60_000)) {
    return NextResponse.json({ error: "Too many lookups. Wait a minute and try again." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { domain?: string; url?: string } | null;
  try {
    return NextResponse.json(await lookupCaa(body?.domain || body?.url || ""));
  } catch (error) {
    if (error instanceof SslCheckError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not look up CAA records." }, { status: 502 });
  }
}
