import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import {
  dodoEnvironment,
  isDodoConfigured,
  isUnauthorizedDodoError,
  otherDodoEnvironment,
  productIdForPlan,
} from "@/lib/billing";
import { upsertSignetUser } from "@/lib/users";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to upgrade." }, { status: 401 });
  }
  const userId = user.id;
  if (!isDodoConfigured()) {
    return NextResponse.json(
      {
        error:
          "Dodo Payments is not configured yet. Add DODO_PAYMENTS_API_KEY, DODO_PRODUCT_PLUS, and DODO_PRODUCT_STUDIO.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as { plan?: "plus" | "studio" };
  if (body.plan !== "plus" && body.plan !== "studio") {
    return NextResponse.json({ error: "Choose Plus or Studio." }, { status: 400 });
  }

  const email = user.email;
  if (!email) {
    return NextResponse.json({ error: "Your Google account needs an email." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    await upsertSignetUser({
      authId: userId,
      email,
      name: user.name,
    });
  }

  const returnUrl =
    process.env.DODO_PAYMENTS_RETURN_URL || "https://www.selfsignedcert.com/billing/success";
  const payload = {
    product_cart: [{ product_id: productIdForPlan(body.plan), quantity: 1 }],
    customer: {
      email,
      name: user.name || email,
    },
    return_url: `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}plan=${body.plan}`,
    metadata: {
      auth_id: userId,
      plan: body.plan,
    },
  };

  const createSession = async (environment: ReturnType<typeof dodoEnvironment>) => {
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment,
    });
    return client.checkoutSessions.create(payload);
  };

  try {
    const session = await createSession(dodoEnvironment());
    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (error) {
    if (isUnauthorizedDodoError(error)) {
      try {
        const session = await createSession(otherDodoEnvironment(dodoEnvironment()));
        return NextResponse.json({ checkout_url: session.checkout_url });
      } catch (retryError) {
        const message = retryError instanceof Error ? retryError.message : "Could not start checkout.";
        console.error("Dodo checkout failed on both environments", message);
        return NextResponse.json({ error: message }, { status: 502 });
      }
    }
    const message = error instanceof Error ? error.message : "Could not start checkout.";
    console.error("Dodo checkout failed", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
