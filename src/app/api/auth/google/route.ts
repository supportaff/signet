import { NextResponse } from "next/server";
import { googleAuthorizeUrl, isGoogleAuthConfigured } from "@/lib/google-oauth";
import { OAUTH_STATE_COOKIE, safeNextPath, sessionCookieOptions } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", url.origin));
  }

  const nonce = crypto.randomUUID();
  const state = Buffer.from(
    JSON.stringify({
      n: nonce,
      next: safeNextPath(url.searchParams.get("next")),
    }),
  ).toString("base64url");

  const response = NextResponse.redirect(googleAuthorizeUrl(url.origin, state));
  response.cookies.set(OAUTH_STATE_COOKIE, nonce, sessionCookieOptions(60 * 10));
  return response;
}
