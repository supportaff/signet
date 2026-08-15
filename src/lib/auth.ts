export const AUTH_STORAGE_KEY = "signet.auth.v1";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "plus" | "studio";
  createdAt: string;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getSession(): AuthUser | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: AuthUser) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("signet-auth"));
}

export function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("signet-auth"));
}

export function updateProfile(patch: Partial<Pick<AuthUser, "name" | "plan">>) {
  const current = getSession();
  if (!current) return null;
  const next = { ...current, ...patch };
  setSession(next);
  return next;
}

export function isGuest(user: AuthUser | null) {
  return !user || user.id === "guest";
}
