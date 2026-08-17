import { NextResponse } from "next/server";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import { checkSecurityHeaders } from "@/lib/security-headers";
import { SslCheckError } from "@/lib/ssl-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(request: Request) {
  if (!allowRequest(clientIp(request), 8, 60_000)) {
    return NextResponse.json({ error: "Too many checks. Wait a minute and try again." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  try {
    return NextResponse.json(await checkSecurityHeaders(body?.url || ""));
  } catch (error) {
    if (error instanceof SslCheckError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not read those headers." }, { status: 502 });
  }
}
