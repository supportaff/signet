import { getSessionUser, type SessionUser } from "@/lib/session";

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export function isAdminConfigured() {
  return adminEmails().length > 0;
}

export async function requireAdmin(): Promise<
  { ok: true; user: SessionUser } | { ok: false; status: number; error: string }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, status: 401, error: "Sign in required." };
  if (!isAdminConfigured()) {
    return {
      ok: false,
      status: 403,
      error: "Set ADMIN_EMAILS to your Google email to open the user list.",
    };
  }
  if (!isAdminEmail(user.email)) {
    return { ok: false, status: 403, error: "Admin access only." };
  }
  return { ok: true, user };
}
