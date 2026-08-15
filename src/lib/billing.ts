import type { PlanId } from "@/lib/plans";

export function isDodoConfigured() {
  return Boolean(
    process.env.DODO_PAYMENTS_API_KEY &&
      process.env.DODO_PRODUCT_PLUS &&
      process.env.DODO_PRODUCT_STUDIO,
  );
}

export function dodoEnvironment(): "test_mode" | "live_mode" {
  return process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";
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
