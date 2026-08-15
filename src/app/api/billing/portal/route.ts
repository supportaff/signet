import { NextRequest, NextResponse } from "next/server";
import { CustomerPortal } from "@dodopayments/nextjs";
import { dodoEnvironment, isDodoConfigured } from "@/lib/billing";
import { getSignetUser } from "@/lib/users";
import { getSessionUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!isDodoConfigured()) {
    return NextResponse.json({ error: "Dodo Payments is not configured yet." }, { status: 503 });
  }

  const account = await getSignetUser(userId);
  if (!account?.dodo_customer_id) {
    return NextResponse.json(
      { error: "No Dodo customer is linked to this account yet. Complete a checkout first." },
      { status: 400 },
    );
  }

  const url = request.nextUrl.clone();
  url.searchParams.set("customer_id", account.dodo_customer_id);
  const rewritten = new NextRequest(url, request);
  return CustomerPortal({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: dodoEnvironment(),
  })(rewritten);
}
