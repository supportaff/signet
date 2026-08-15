import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { dodoEnvironment, isDodoConfigured, productIdForPlan } from "@/lib/billing";
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
      clerkId: userId,
      email,
      name: user.name,
    });
  }

  const origin = new URL(request.url).origin;
  const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: dodoEnvironment(),
  });

  const session = await client.checkoutSessions.create({
    product_cart: [{ product_id: productIdForPlan(body.plan), quantity: 1 }],
    customer: {
      email,
      name: user.name || email,
    },
    return_url: `${origin}/billing/success?plan=${body.plan}`,
    metadata: {
      auth_id: userId,
      clerk_id: userId,
      plan: body.plan,
    },
  });

  return NextResponse.json({ checkout_url: session.checkout_url });
}
