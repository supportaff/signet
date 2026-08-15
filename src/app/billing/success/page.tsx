import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Billing",
  robots: { index: false, follow: false },
};

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; status?: string }>;
}) {
  const params = await searchParams;
  const plan = params.plan === "studio" ? "Studio" : params.plan === "plus" ? "Plus" : "your plan";

  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center">
      <p className="eyebrow">Dodo Payments</p>
      <h1 className="display mt-3 text-5xl">Checkout complete.</h1>
      <p className="mt-4 text-ink-soft">
        If the payment succeeded, {plan} will unlock as soon as Dodo confirms it.
        That happens on the webhook — not because this page loaded.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "wax" }))}>
          Dashboard
        </Link>
        <Link href="/generate" className={cn(buttonVariants({ variant: "outline" }))}>
          Generate
        </Link>
      </div>
    </div>
  );
}
