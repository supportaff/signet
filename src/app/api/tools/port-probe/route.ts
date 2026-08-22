import { NextResponse } from "next/server";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import { probeWebPorts } from "@/lib/port-probe";
import { SslCheckError } from "@/lib/ssl-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(request: Request) {
  if (!allowRequest(clientIp(request), 4, 60_000)) {
    return NextResponse.json({ error: "Too many scans. Wait a minute and try again." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { url?: string; host?: string } | null;
  try {
    return NextResponse.json(await probeWebPorts(body?.url || body?.host || ""));
  } catch (error) {
    if (error instanceof SslCheckError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not probe that host." }, { status: 502 });
  }
}
