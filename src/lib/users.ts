import { PLAN_LIMITS, type PlanId } from "@/lib/plans";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export interface SignetAccount {
  auth_id: string;
  email: string | null;
  name: string | null;
  plan: PlanId;
  plan_status: string;
  certs_used: number;
  login_count: number;
  last_login_at: string | null;
  dodo_customer_id: string | null;
  dodo_subscription_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface SignetLoginEvent {
  id: string;
  auth_id: string;
  email: string | null;
  created_at: string;
}

export type TrackingStatus = "ok" | "not_configured" | "missing_tables" | "error";

function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    Boolean(error.message?.includes("Could not find the table")) ||
    Boolean(error.message?.includes("does not exist"))
  );
}

function normalizeAccount(row: SignetAccount): SignetAccount {
  return {
    ...row,
    plan: row.plan === "plus" || row.plan === "studio" ? row.plan : "free",
    plan_status: row.plan_status || "active",
    certs_used: row.certs_used ?? 0,
    login_count: row.login_count ?? 0,
    last_login_at: row.last_login_at ?? null,
  };
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

export async function getTrackingStatus(): Promise<{ status: TrackingStatus; message?: string }> {
  if (!isSupabaseConfigured()) return { status: "not_configured" };
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("signet_users").select("auth_id").limit(1);
  if (!error) return { status: "ok" };
  if (isMissingTable(error)) return { status: "missing_tables" };
  return { status: "error", message: error.message };
}

export async function upsertSignetUser(input: {
  authId: string;
  email?: string | null;
  name?: string | null;
  touchLogin?: boolean;
}) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const existing = await getSignetUser(input.authId);
  const nextLoginCount = input.touchLogin ? (existing?.login_count ?? 0) + 1 : existing?.login_count ?? 0;
  const payload = {
    auth_id: input.authId,
    email: input.email ?? existing?.email ?? null,
    name: input.name ?? existing?.name ?? null,
    updated_at: now,
    ...(input.touchLogin
      ? {
          last_login_at: now,
          login_count: nextLoginCount,
        }
      : {}),
  };

  const { data, error } = await supabase
    .from("signet_users")
    .upsert(payload, { onConflict: "auth_id" })
    .select()
    .single();

  if (error) {
    if (isMissingTable(error)) return null;
    if (input.touchLogin && (error.message?.includes("last_login_at") || error.message?.includes("login_count"))) {
      const { data: fallback, error: fallbackError } = await supabase
        .from("signet_users")
        .upsert(
          {
            auth_id: input.authId,
            email: input.email ?? existing?.email ?? null,
            name: input.name ?? existing?.name ?? null,
            updated_at: now,
          },
          { onConflict: "auth_id" },
        )
        .select()
        .single();
      if (fallbackError) {
        if (isMissingTable(fallbackError)) return null;
        throw fallbackError;
      }
      return normalizeAccount(fallback as SignetAccount);
    }
    throw error;
  }

  if (input.touchLogin) {
    await supabase.from("signet_login_events").insert({
      auth_id: input.authId,
      email: input.email ?? existing?.email ?? null,
    });
  }

  return normalizeAccount(data as SignetAccount);
}

export async function getSignetUser(authId: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("signet_users").select("*").eq("auth_id", authId).maybeSingle();
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return data ? normalizeAccount(data as SignetAccount) : null;
}

export async function listSignetUsers() {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signet_users")
    .select("*")
    .order("last_login_at", { ascending: false, nullsFirst: false });
  if (error) {
    if (isMissingTable(error)) return [];
    const { data: fallback, error: fallbackError } = await supabase
      .from("signet_users")
      .select("*")
      .order("updated_at", { ascending: false });
    if (fallbackError) {
      if (isMissingTable(fallbackError)) return [];
      throw fallbackError;
    }
    return ((fallback ?? []) as SignetAccount[]).map(normalizeAccount);
  }
  return ((data ?? []) as SignetAccount[]).map(normalizeAccount);
}

export async function listRecentLogins(limit = 20) {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("signet_login_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (isMissingTable(error)) return [];
    return [];
  }
  return (data ?? []) as SignetLoginEvent[];
}

export async function setUserPlan(input: {
  authId: string;
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
    .eq("auth_id", input.authId)
    .select()
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return data ? normalizeAccount(data as SignetAccount) : null;
}

export async function recordCertificateEvent(input: {
  authId: string;
  certType: string;
  commonName: string;
  fingerprintSha256?: string;
}) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const existing = await getSignetUser(input.authId);
  if (!existing) {
    await upsertSignetUser({ authId: input.authId });
  }
  const current = existing ?? (await getSignetUser(input.authId));
  const quota = accountQuota({
    plan: current?.plan ?? "free",
    certs_used: current?.certs_used ?? 0,
  });
  if (!quota.allowed) {
    throw new Error(`You've used all ${quota.limit} certificates on the ${quota.plan} plan.`);
  }

  const { error: eventError } = await supabase.from("signet_certificate_events").insert({
    auth_id: input.authId,
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
    .eq("auth_id", input.authId)
    .select()
    .single();
  if (error) throw error;
  return normalizeAccount(data as SignetAccount);
}

export async function logPaymentEvent(input: {
  authId?: string | null;
  dodoPaymentId?: string | null;
  dodoSubscriptionId?: string | null;
  plan?: string | null;
  eventType: string;
  status?: string | null;
}) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseAdmin();
  await supabase.from("signet_payments").insert({
    auth_id: input.authId ?? null,
    dodo_payment_id: input.dodoPaymentId ?? null,
    dodo_subscription_id: input.dodoSubscriptionId ?? null,
    plan: input.plan ?? null,
    event_type: input.eventType,
    status: input.status ?? null,
  });
}

export async function deleteSignetUser(authId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("signet_users").delete().eq("auth_id", authId);
  if (error && !isMissingTable(error)) throw error;
}
