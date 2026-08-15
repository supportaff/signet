import { Webhooks } from "@dodopayments/nextjs";
import { planFromProductId } from "@/lib/billing";
import { logPaymentEvent, setUserPlan, upsertSignetUser } from "@/lib/users";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DodoPayload = {
  type?: string;
  data?: {
    subscription_id?: string;
    payment_id?: string;
    customer?: { customer_id?: string; email?: string };
    customer_id?: string;
    product_id?: string;
    product?: { product_id?: string };
    metadata?: Record<string, string>;
    status?: string;
  };
  metadata?: Record<string, string>;
};

function webhookSecret() {
  return (process.env.DODO_PAYMENTS_WEBHOOK_KEY || process.env.DODO_WEBHOOK_SECRET || "").trim();
}

function authIdFrom(payload: DodoPayload) {
  return (
    payload.data?.metadata?.auth_id ||
    payload.metadata?.auth_id ||
    payload.data?.metadata?.user_id ||
    null
  );
}

function planFrom(payload: DodoPayload): PlanId | null {
  const fromMeta = payload.data?.metadata?.plan || payload.metadata?.plan;
  if (fromMeta === "plus" || fromMeta === "studio") return fromMeta;
  return planFromProductId(payload.data?.product_id || payload.data?.product?.product_id);
}

async function applyPlan(payload: DodoPayload, planStatus: string) {
  const authId = authIdFrom(payload);
  const plan = planFrom(payload);
  if (!authId || !plan) {
    console.error("Dodo webhook missing auth_id or plan", {
      type: payload.type,
      authId,
      plan,
      productId: payload.data?.product_id || payload.data?.product?.product_id,
    });
    return;
  }
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

function dodoHandler() {
  const webhookKey = webhookSecret();
  if (!webhookKey) {
    return async () =>
      Response.json({ error: "DODO_PAYMENTS_WEBHOOK_KEY is not set." }, { status: 503 });
  }

  return Webhooks({
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
    onSubscriptionPlanChanged: async (payload) => {
      await applyPlan(payload as DodoPayload, "active");
    },
    onSubscriptionUpdated: async (payload) => {
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
  });
}

export async function GET() {
  return Response.json({
    ok: true,
    configured: Boolean(webhookSecret()),
  });
}

export async function POST(request: Request) {
  return dodoHandler()(request as never);
}
