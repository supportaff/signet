import { NextResponse } from "next/server";
import { accountQuota, getSignetUser, upsertSignetUser } from "@/lib/users";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, userId: user.id, user });
  }

  let account = await getSignetUser(user.id);
  if (!account) {
    account = await upsertSignetUser({
      clerkId: user.id,
      email: user.email,
      name: user.name,
    });
  }

  if (!account) {
    return NextResponse.json({ error: "Could not load account." }, { status: 500 });
  }

  return NextResponse.json({
    configured: true,
    account,
    quota: accountQuota(account),
    user,
  });
}
