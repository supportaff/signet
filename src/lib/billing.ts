import type { PlanId } from "@/lib/plans";

export function isDodoConfigured() {
  return Boolean(
    process.env.DODO_PAYMENTS_API_KEY &&
      process.env.DODO_PRODUCT_PLUS &&
      process.env.DODO_PRODUCT_STUDIO,
  );
}

export type DodoEnvironment = "test_mode" | "live_mode";

export function dodoEnvironment(): DodoEnvironment {
  return process.env.DODO_PAYMENTS_ENVIRONMENT === "test_mode" ? "test_mode" : "live_mode";
}

export function otherDodoEnvironment(current: DodoEnvironment): DodoEnvironment {
  return current === "live_mode" ? "test_mode" : "live_mode";
}

export function isUnauthorizedDodoError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /401|unauthorized|invalid api key|invalid token/i.test(message);
}

export function productIdForPlan(plan: Exclude<PlanId, "free">) {
  const id = plan === "studio" ? process.env.DODO_PRODUCT_STUDIO : process.env.DODO_PRODUCT_PLUS;
  if (!id) {
    throw new Error(`Missing Dodo product id for ${plan}. Set DODO_PRODUCT_${plan.toUpperCase()}.`);
  }
  return id;
}

export function planFromProductId(productId?: string | null): Exclude<PlanId, "free"> | null {
  if (!productId) return null;
  if (productId === process.env.DODO_PRODUCT_STUDIO) return "studio";
  if (productId === process.env.DODO_PRODUCT_PLUS) return "plus";
  return null;
}
