import { NextResponse } from "next/server";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import { checkRemoteCertificate, SslCheckError } from "@/lib/ssl-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

async function readUrl(request: Request) {
  if (request.method === "GET") {
    return new URL(request.url).searchParams.get("url") || new URL(request.url).searchParams.get("host") || "";
  }
  const body = (await request.json().catch(() => null)) as { url?: string; host?: string } | null;
  return body?.url || body?.host || "";
}

async function handle(request: Request) {
  if (!allowRequest(clientIp(request), 8, 60_000)) {
    return NextResponse.json(
      { error: "Too many checks. Wait a minute and try again." },
      { status: 429 },
    );
  }

  const url = await readUrl(request);
  try {
    const result = await checkRemoteCertificate(url);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SslCheckError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not check that certificate." }, { status: 502 });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
