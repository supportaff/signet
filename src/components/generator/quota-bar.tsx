"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { useQuota } from "@/hooks/use-quota";
import { startCheckout } from "@/lib/billing-client";
import { PLAN_LIMITS, nextPlan, planLabel } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function QuotaBar() {
  const { quota, user } = useQuota();
  const ratio = quota.limit === 0 ? 0 : Math.min(1, quota.used / quota.limit);
  const upgrade = nextPlan(quota.plan);

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-bg-muted/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{planLabel(quota.plan)} plan</span>
          <span className="text-muted">
            {" "}
            · {quota.used} of {quota.limit} certificates used
          </span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className={cn("h-full rounded-full transition-all", quota.allowed ? "bg-wax" : "bg-danger")}
            style={{ width: `${Math.max(ratio * 100, quota.used > 0 ? 8 : 0)}%` }}
          />
        </div>
      </div>
      {upgrade ? (
        <Link href="/pricing" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}>
          {planLabel(upgrade)} · {PLAN_LIMITS[upgrade]} certs
        </Link>
      ) : (
        <p className="text-xs text-muted">{quota.remaining} remaining</p>
      )}
      {!user ? (
        <Link href="/login?next=/generate" className="text-xs text-muted hover:text-ink">
          Sign in to keep your plan
        </Link>
      ) : null}
    </div>
  );
}

export function LimitReached() {
  const { quota, user } = useQuota();
  const upgrade = nextPlan(quota.plan);

  const checkout = async (plan: "plus" | "studio") => {
    if (!user || user.id === "guest") {
      window.location.href = `/login?next=/pricing`;
      return;
    }
    try {
      await startCheckout(plan);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed.");
    }
  };

  return (
    <div className="rounded-[28px] border border-line bg-surface px-6 py-12 text-center shadow-lift">
      <p className="eyebrow text-wax">Limit reached</p>
      <h2 className="mt-3 font-serif text-3xl tracking-tight">
        {quota.used} of {quota.limit} on {planLabel(quota.plan)}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        {quota.plan === "free"
          ? "Free includes 3 certificates. Plus is $5 for 25. Studio is $12 for 50. Checkout runs through Dodo Payments."
          : quota.plan === "plus"
            ? "Plus includes 25 certificates. Studio is $12 for 50."
            : "Studio tops out at 50 certificates."}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {upgrade ? (
          <Button variant="wax" onClick={() => checkout(upgrade)}>
            Upgrade to {planLabel(upgrade)} · ${upgrade === "studio" ? "12" : "5"}
          </Button>
        ) : null}
        {quota.plan === "free" ? (
          <Button variant="outline" onClick={() => checkout("studio")}>
            Studio · $12
          </Button>
        ) : null}
        <Link href="/pricing" className={cn(buttonVariants({ variant: "outline" }))}>
          Compare plans
        </Link>
      </div>
    </div>
  );
}
