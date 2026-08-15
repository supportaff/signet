import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { accountQuota, upsertSignetUser } from "@/lib/users";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false });
  }

  const clerkUser = await currentUser();
  const account = await upsertSignetUser({
    clerkId: userId,
    email: clerkUser?.primaryEmailAddress?.emailAddress,
    name: clerkUser?.fullName || clerkUser?.firstName,
  });

  return NextResponse.json({
    configured: true,
    account,
    quota: account ? accountQuota(account) : null,
  });
}
