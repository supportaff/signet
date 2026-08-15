import { NextResponse } from "next/server";
import { googleUserFromCode, isGoogleAuthConfigured } from "@/lib/google-oauth";
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
  const url = new URL(request.url);
  const fail = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, url.origin));

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
  try {
    const parsed = JSON.parse(Buffer.from(returnedState, "base64url").toString("utf8")) as {
      n?: string;
      next?: string;
    };
    if (!storedNonce || parsed.n !== storedNonce) return fail("google_state");
    nextPath = safeNextPath(parsed.next);
  } catch {
    return fail("google_state");
  }

  try {
    const user = await googleUserFromCode(url.origin, code);
    if (isSupabaseConfigured()) {
      await upsertSignetUser({
        clerkId: user.id,
        email: user.email,
        name: user.name,
      });
    }

    const response = NextResponse.redirect(new URL(nextPath, url.origin));
    response.cookies.set(SESSION_COOKIE, await signSession(user), sessionCookieOptions());
    response.cookies.set(OAUTH_STATE_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
    return response;
  } catch {
    return fail("google_failed");
  }
}
