import { PLAN_LIMITS, type PlanId } from "@/lib/plans";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export interface SignetAccount {
  clerk_id: string;
  email: string | null;
  name: string | null;
  plan: PlanId;
  plan_status: string;
  certs_used: number;
  dodo_customer_id: string | null;
  dodo_subscription_id: string | null;
  created_at: string;
}

export function accountQuota(account: Pick<SignetAccount, "plan" | "certs_used">) {
  const limit = PLAN_LIMITS[account.plan] ?? PLAN_LIMITS.free;
  return {
    plan: account.plan,
    limit,
    used: account.certs_used,
    remaining: Math.max(0, limit - account.certs_used),
    allowed: account.certs_used < limit,
  };
}

export async function upsertSignetUser(input: {
  clerkId: string;
  email?: string | null;
  name?: string | null;
}) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signet_users")
    .upsert(
      {
        clerk_id: input.clerkId,
        email: input.email ?? null,
        name: input.name ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as SignetAccount;
}

export async function getSignetUser(clerkId: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signet_users")
    .select("*")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  if (error) throw error;
  return (data as SignetAccount | null) ?? null;
}

export async function setUserPlan(input: {
  clerkId: string;
  plan: PlanId;
  planStatus?: string;
  dodoCustomerId?: string | null;
  dodoSubscriptionId?: string | null;
}) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signet_users")
    .update({
      plan: input.plan,
      plan_status: input.planStatus ?? "active",
      dodo_customer_id: input.dodoCustomerId,
      dodo_subscription_id: input.dodoSubscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_id", input.clerkId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as SignetAccount | null;
}

export async function recordCertificateEvent(input: {
  clerkId: string;
  certType: string;
  commonName: string;
  fingerprintSha256?: string;
}) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const existing = await getSignetUser(input.clerkId);
  if (!existing) {
    await upsertSignetUser({ clerkId: input.clerkId });
  }
  const current = existing ?? (await getSignetUser(input.clerkId));
  const quota = accountQuota({
    plan: current?.plan ?? "free",
    certs_used: current?.certs_used ?? 0,
  });
  if (!quota.allowed) {
    throw new Error(`You've used all ${quota.limit} certificates on the ${quota.plan} plan.`);
  }

  const { error: eventError } = await supabase.from("signet_certificate_events").insert({
    clerk_id: input.clerkId,
    cert_type: input.certType,
    common_name: input.commonName,
    fingerprint_sha256: input.fingerprintSha256 || null,
  });
  if (eventError) throw eventError;

  const { data, error } = await supabase
    .from("signet_users")
    .update({
      certs_used: (current?.certs_used ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_id", input.clerkId)
    .select()
    .single();
  if (error) throw error;
  return data as SignetAccount;
}

export async function logPaymentEvent(input: {
  clerkId?: string | null;
  dodoPaymentId?: string | null;
  dodoSubscriptionId?: string | null;
  plan?: string | null;
  eventType: string;
  status?: string | null;
}) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseAdmin();
  await supabase.from("signet_payments").insert({
    clerk_id: input.clerkId ?? null,
    dodo_payment_id: input.dodoPaymentId ?? null,
    dodo_subscription_id: input.dodoSubscriptionId ?? null,
    plan: input.plan ?? null,
    event_type: input.eventType,
    status: input.status ?? null,
  });
}

export async function deleteSignetUser(clerkId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseAdmin();
  await supabase.from("signet_users").delete().eq("clerk_id", clerkId);
}
