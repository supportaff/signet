import { NextResponse } from "next/server";
import { accountQuota, recordCertificateEvent } from "@/lib/users";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getSessionUser();
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false });
  }

  const body = (await request.json()) as {
    certType?: string;
    commonName?: string;
    fingerprintSha256?: string;
  };

  try {
    const account = await recordCertificateEvent({
      clerkId: userId,
      certType: body.certType || "unknown",
      commonName: body.commonName || "certificate",
      fingerprintSha256: body.fingerprintSha256,
    });
    return NextResponse.json({
      configured: true,
      account,
      quota: account ? accountQuota(account) : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not record certificate.";
    const status = message.includes("used all") ? 402 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
