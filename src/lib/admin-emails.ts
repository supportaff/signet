const ADMIN_EMAILS = ["prakashmurthy5199@gmail.com"];

export function normalizeEmail(email?: string | null) {
  return (email || "").trim().toLowerCase();
}

export function isAdminEmail(email?: string | null) {
  const value = normalizeEmail(email);
  return value.length > 0 && ADMIN_EMAILS.includes(value);
}
