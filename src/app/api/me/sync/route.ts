import { NextResponse } from "next/server";
import { accountQuota, upsertSignetUser, usageThisPeriod } from "@/lib/users";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/session";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, user });
  }

  const account = await upsertSignetUser({
    authId: user.id,
    email: user.email,
    name: user.name,
  });

  return NextResponse.json({
    configured: true,
    account,
    quota: account ? accountQuota(account, await usageThisPeriod(user.id)) : null,
    user,
  });
}
