import { NextResponse } from "next/server";
import { checkRemoteCertificate, SslCheckError } from "@/lib/ssl-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const WINDOW_MS = 60_000;
const LIMIT = 12;
const buckets = new Map<string, { count: number; reset: number }>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function allow(ip: string) {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.reset) {
    buckets.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= LIMIT) return false;
  bucket.count += 1;
  return true;
}

async function readUrl(request: Request) {
  if (request.method === "GET") {
    return new URL(request.url).searchParams.get("url") || new URL(request.url).searchParams.get("host") || "";
  }
  const body = (await request.json().catch(() => null)) as { url?: string; host?: string } | null;
  return body?.url || body?.host || "";
}

async function handle(request: Request) {
  if (!allow(clientIp(request))) {
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
