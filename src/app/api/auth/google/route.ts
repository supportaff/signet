import { NextResponse } from "next/server";
import { authOrigin, googleAuthorizeUrl, googleRedirectUri, isGoogleAuthConfigured } from "@/lib/google-oauth";
import { OAUTH_STATE_COOKIE, safeNextPath, sessionCookieOptions } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = authOrigin(request);
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", origin));
  }

  const redirectUri = googleRedirectUri(origin);
  const nonce = crypto.randomUUID();
  const state = Buffer.from(
    JSON.stringify({
      n: nonce,
      next: safeNextPath(new URL(request.url).searchParams.get("next")),
      redirectUri,
    }),
  ).toString("base64url");

  const response = NextResponse.redirect(googleAuthorizeUrl(redirectUri, state));
  response.cookies.set(OAUTH_STATE_COOKIE, nonce, sessionCookieOptions(60 * 10));
  return response;
}
