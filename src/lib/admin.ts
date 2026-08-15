import { getSessionUser, type SessionUser } from "@/lib/session";

const HARD_ADMINS = ["prakashmurthy5199@gmail.com"];

export function adminEmails() {
  return HARD_ADMINS;
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return HARD_ADMINS.includes(email.trim().toLowerCase());
}

export function isAdminConfigured() {
  return true;
}

export async function requireAdmin(): Promise<
  { ok: true; user: SessionUser } | { ok: false; status: number; error: string }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, status: 401, error: "Sign in required." };
  if (!isAdminEmail(user.email)) {
    return { ok: false, status: 403, error: "Admin access only." };
  }
  return { ok: true, user };
}
