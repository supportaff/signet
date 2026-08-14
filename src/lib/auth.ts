export const AUTH_STORAGE_KEY = "signet.auth.v1";
export const USERS_STORAGE_KEY = "signet.users.v1";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "studio";
  createdAt: string;
}

export const DEMO_USER: AuthUser = {
  id: "demo-alex",
  name: "Alex Rivera",
  email: "demo@signet.dev",
  plan: "studio",
  createdAt: "2025-11-02T14:20:00.000Z",
};

export const DEMO_PASSWORD = "signet";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readUsers(): Record<string, { user: AuthUser; password: string }> {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, { user: AuthUser; password: string }>) : {};
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, { user: AuthUser; password: string }>) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
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

export function loginWithPassword(email: string, password: string): AuthUser {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    throw new Error("Email and password are required.");
  }

  if (normalized === DEMO_USER.email && password === DEMO_PASSWORD) {
    setSession(DEMO_USER);
    return DEMO_USER;
  }

  const users = readUsers();
  const record = users[normalized];
  if (record && record.password === password) {
    setSession(record.user);
    return record.user;
  }

  if (record && record.password !== password) {
    throw new Error("That password doesn't match this demo account.");
  }

  throw new Error("No account with that email. Create one, or use demo@signet.dev / signet.");
}

export function signupWithPassword(name: string, email: string, password: string): AuthUser {
  const normalized = email.trim().toLowerCase();
  if (!name.trim()) throw new Error("Please add your name.");
  if (!normalized) throw new Error("Please add an email.");
  if (password.length < 6) throw new Error("Use at least 6 characters for this demo password.");
  if (normalized === DEMO_USER.email) {
    throw new Error("That email is reserved for the demo account. Sign in instead.");
  }

  const users = readUsers();
  if (users[normalized]) {
    throw new Error("An account with that email already exists on this device.");
  }

  const user: AuthUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  users[normalized] = { user, password };
  writeUsers(users);
  setSession(user);
  return user;
}

export function loginWithMagicLink(email: string): AuthUser {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("Enter an email first.");
  if (normalized === DEMO_USER.email) {
    setSession(DEMO_USER);
    return DEMO_USER;
  }
  const users = readUsers();
  if (users[normalized]) {
    setSession(users[normalized].user);
    return users[normalized].user;
  }
  const user: AuthUser = {
    id: crypto.randomUUID(),
    name: normalized.split("@")[0] || "Guest",
    email: normalized,
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  users[normalized] = { user, password: crypto.randomUUID() };
  writeUsers(users);
  setSession(user);
  return user;
}

export function continueAsGuest(): AuthUser {
  const guest: AuthUser = {
    id: "guest",
    name: "Guest",
    email: "guest@local",
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  setSession(guest);
  return guest;
}

export function continueAsDemo(): AuthUser {
  setSession(DEMO_USER);
  return DEMO_USER;
}

export function updateProfile(patch: Partial<Pick<AuthUser, "name" | "plan">>) {
  const current = getSession();
  if (!current) return null;
  const next = { ...current, ...patch };
  setSession(next);
  if (current.id !== "guest" && current.id !== DEMO_USER.id) {
    const users = readUsers();
    if (users[current.email]) {
      users[current.email].user = next;
      writeUsers(users);
    }
  }
  return next;
}

export function isGuest(user: AuthUser | null) {
  return !user || user.id === "guest";
}
