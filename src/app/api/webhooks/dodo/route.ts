import { Webhooks } from "@dodopayments/nextjs";
import { planFromProductId } from "@/lib/billing";
import { logPaymentEvent, setUserPlan, upsertSignetUser } from "@/lib/users";
import type { PlanId } from "@/lib/plans";

type DodoPayload = {
  type?: string;
  data?: {
    subscription_id?: string;
    payment_id?: string;
    customer?: { customer_id?: string; email?: string };
    customer_id?: string;
    product_id?: string;
    metadata?: Record<string, string>;
    status?: string;
  };
};

function authIdFrom(payload: DodoPayload) {
  return payload.data?.metadata?.auth_id || null;
}

function planFrom(payload: DodoPayload): PlanId | null {
  const fromMeta = payload.data?.metadata?.plan;
  if (fromMeta === "plus" || fromMeta === "studio") return fromMeta;
  return planFromProductId(payload.data?.product_id);
}

async function applyPlan(payload: DodoPayload, planStatus: string) {
  const authId = authIdFrom(payload);
  const plan = planFrom(payload);
  if (!authId || !plan) return;
  await upsertSignetUser({
    authId,
    email: payload.data?.customer?.email,
  });
  await setUserPlan({
    authId,
    plan,
    planStatus,
    dodoCustomerId: payload.data?.customer?.customer_id || payload.data?.customer_id,
    dodoSubscriptionId: payload.data?.subscription_id,
  });
}

const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY || process.env.DODO_WEBHOOK_SECRET || "";

export const POST = webhookKey
  ? Webhooks({
      webhookKey,
      onPayload: async (payload) => {
    const body = payload as DodoPayload;
    await logPaymentEvent({
      authId: authIdFrom(body),
      dodoPaymentId: body.data?.payment_id,
      dodoSubscriptionId: body.data?.subscription_id,
      plan: planFrom(body),
      eventType: body.type || "unknown",
      status: body.data?.status,
    });
  },
  onSubscriptionActive: async (payload) => {
    await applyPlan(payload as DodoPayload, "active");
  },
  onSubscriptionRenewed: async (payload) => {
    await applyPlan(payload as DodoPayload, "active");
  },
  onSubscriptionCancelled: async (payload) => {
    const authId = authIdFrom(payload as DodoPayload);
    if (!authId) return;
    await setUserPlan({ authId, plan: "free", planStatus: "canceled" });
  },
  onSubscriptionExpired: async (payload) => {
    const authId = authIdFrom(payload as DodoPayload);
    if (!authId) return;
    await setUserPlan({ authId, plan: "free", planStatus: "expired" });
  },
  onSubscriptionOnHold: async (payload) => {
    const authId = authIdFrom(payload as DodoPayload);
    if (!authId) return;
    await setUserPlan({
      authId,
      plan: planFrom(payload as DodoPayload) ?? "plus",
      planStatus: "past_due",
    });
  },
      onPaymentSucceeded: async (payload) => {
        const body = payload as DodoPayload;
        if (body.data?.subscription_id) {
          await applyPlan(body, "active");
        }
      },
    })
  : async () =>
      Response.json(
        { error: "DODO_PAYMENTS_WEBHOOK_KEY is not set." },
        { status: 503 },
      );
