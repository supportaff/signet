import type { AuthUser } from "@/lib/auth";

export const PLAN_LIMITS = {
  free: 3,
  studio: 25,
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;

export const USAGE_STORAGE_KEY = "signet.usage.v1";

export interface Quota {
  plan: PlanId;
  limit: number;
  used: number;
  remaining: number;
  allowed: boolean;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readUsage(): Record<string, number> {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeUsage(map: Record<string, number>) {
  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("signet-quota"));
}

export function planOf(user: AuthUser | null): PlanId {
  return user?.plan === "studio" ? "studio" : "free";
}

export function planLabel(plan: PlanId) {
  return plan === "studio" ? "Studio" : "Free";
}

export function usageKey(user: AuthUser | null) {
  if (user && user.id !== "guest") return user.id;
  return "device";
}

export function getQuota(user: AuthUser | null): Quota {
  const plan = planOf(user);
  const limit = PLAN_LIMITS[plan];
  const used = readUsage()[usageKey(user)] ?? 0;
  return {
    plan,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    allowed: used < limit,
  };
}

export function incrementUsage(user: AuthUser | null) {
  const key = usageKey(user);
  const map = readUsage();
  map[key] = (map[key] ?? 0) + 1;
  writeUsage(map);
}

export function assertCanGenerate(user: AuthUser | null) {
  const quota = getQuota(user);
  if (!quota.allowed) {
    throw new Error(
      `You've used all ${quota.limit} certificates on the ${planLabel(quota.plan)} plan.`,
    );
  }
  return quota;
}
