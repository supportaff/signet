import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { accountQuota, getSignetUser, upsertSignetUser } from "@/lib/users";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, userId });
  }

  const clerkUser = await currentUser();
  let account = await getSignetUser(userId);
  if (!account) {
    account = await upsertSignetUser({
      clerkId: userId,
      email: clerkUser?.primaryEmailAddress?.emailAddress,
      name: clerkUser?.fullName || clerkUser?.firstName,
    });
  }

  if (!account) {
    return NextResponse.json({ error: "Could not load account." }, { status: 500 });
  }

  return NextResponse.json({
    configured: true,
    account,
    quota: accountQuota(account),
  });
}
