import { NextResponse } from "next/server";
import {
  accountQuota,
  getSignetUser,
  getTrackingStatus,
  upsertSignetUser,
  usageThisPeriod,
} from "@/lib/users";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/session";
import { isAdminConfigured, isAdminEmail } from "@/lib/admin";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const tracking = await getTrackingStatus();
  if (!isSupabaseConfigured() || tracking.status !== "ok") {
    return NextResponse.json({
      configured: false,
      tracking: tracking.status,
      trackingMessage: tracking.message,
      userId: user.id,
      user,
      isAdmin: isAdminEmail(user.email),
      adminConfigured: isAdminConfigured(),
    });
  }

  let account = await getSignetUser(user.id);
  if (!account) {
    account = await upsertSignetUser({
      authId: user.id,
      email: user.email,
      name: user.name,
    });
  }

  if (!account) {
    return NextResponse.json({ error: "Could not load account." }, { status: 500 });
  }

  return NextResponse.json({
    configured: true,
    tracking: "ok",
    account,
    quota: accountQuota(account, await usageThisPeriod(user.id)),
    user,
    isAdmin: isAdminEmail(user.email),
    adminConfigured: isAdminConfigured(),
  });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { confirm?: string } | null;
  if ((body?.confirm || "").trim().toLowerCase() !== user.email.trim().toLowerCase()) {
    return NextResponse.json({ error: "Type your email to confirm deletion." }, { status: 400 });
  }

  const { deleteSignetUser } = await import("@/lib/users");
  await deleteSignetUser(user.id);
  const { SESSION_COOKIE, OAUTH_STATE_COOKIE, sessionCookieOptions } = await import("@/lib/session");
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
  response.cookies.set(OAUTH_STATE_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
  return response;
}
