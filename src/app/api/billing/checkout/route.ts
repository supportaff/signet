import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { dodoEnvironment, isDodoConfigured, productIdForPlan } from "@/lib/billing";
import { upsertSignetUser } from "@/lib/users";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to upgrade." }, { status: 401 });
  }
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

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "Your Google account needs an email." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    await upsertSignetUser({
      clerkId: userId,
      email,
      name: user.fullName || user.firstName,
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
      name: user.fullName || user.firstName || email,
    },
    return_url: `${origin}/billing/success?plan=${body.plan}`,
    metadata: {
      clerk_id: userId,
      plan: body.plan,
    },
  });

  return NextResponse.json({ checkout_url: session.checkout_url });
}
