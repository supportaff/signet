import { isAdminEmail } from "@/lib/admin-emails";
import { getSessionUser, type SessionUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getSignetUser } from "@/lib/users";

export { isAdminEmail };

export function isAdminConfigured() {
  return true;
}

export async function userIsAdmin(user: SessionUser) {
  if (isAdminEmail(user.email)) return true;
  if (!isSupabaseConfigured()) return false;
  try {
    const account = await getSignetUser(user.id);
    return isAdminEmail(account?.email);
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<
  { ok: true; user: SessionUser } | { ok: false; status: number; error: string }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, status: 401, error: "Sign in required." };
  if (!(await userIsAdmin(user))) {
    return { ok: false, status: 403, error: "Admin access only." };
  }
  return { ok: true, user };
}
