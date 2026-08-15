import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function supabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export function supabaseSecretKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabaseSecretKey());
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = supabaseUrl();
  const key = supabaseSecretKey();
  if (!url || !key) {
    throw new Error("Supabase is not configured.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
