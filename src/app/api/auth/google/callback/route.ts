import { NextResponse } from "next/server";
import {
  authOrigin,
  googleRedirectUri,
  googleUserFromCode,
  isGoogleAuthConfigured,
} from "@/lib/google-oauth";
import {
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  safeNextPath,
  sessionCookieOptions,
  signSession,
} from "@/lib/session";
import { upsertSignetUser } from "@/lib/users";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = authOrigin(request);
  const url = new URL(request.url);
  const fail = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, origin));

  if (!isGoogleAuthConfigured()) return fail("google_not_configured");

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  if (!code || !returnedState) return fail("google_denied");

  const storedNonce = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.slice(OAUTH_STATE_COOKIE.length + 1);

  let nextPath = "/dashboard";
  let redirectUri = googleRedirectUri(origin);
  try {
    const parsed = JSON.parse(Buffer.from(returnedState, "base64url").toString("utf8")) as {
      n?: string;
      next?: string;
      redirectUri?: string;
    };
    if (!storedNonce || parsed.n !== storedNonce) return fail("google_state");
    nextPath = safeNextPath(parsed.next);
    if (parsed.redirectUri) redirectUri = parsed.redirectUri;
  } catch {
    return fail("google_state");
  }

  let user;
  try {
    user = await googleUserFromCode(redirectUri, code);
  } catch (error) {
    console.error("Google token exchange failed", error);
    return fail("google_failed");
  }

  if (isSupabaseConfigured()) {
    try {
      await upsertSignetUser({
        clerkId: user.id,
        email: user.email,
        name: user.name,
        touchLogin: true,
      });
    } catch (error) {
      console.error("Supabase user sync failed after Google sign-in", error);
    }
  }

  const response = NextResponse.redirect(new URL(nextPath, origin));
  response.cookies.set(SESSION_COOKIE, await signSession(user), sessionCookieOptions());
  response.cookies.set(OAUTH_STATE_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
  return response;
}
