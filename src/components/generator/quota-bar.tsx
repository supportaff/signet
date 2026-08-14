"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { useQuota } from "@/hooks/use-quota";
import { updateProfile } from "@/lib/auth";
import { planLabel } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function QuotaBar() {
  const { quota, user } = useQuota();
  const ratio = quota.limit === 0 ? 0 : Math.min(1, quota.used / quota.limit);

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
      {quota.plan === "free" ? (
        <Link href="/pricing" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}>
          Studio · 25 certs
        </Link>
      ) : (
        <p className="text-xs text-muted">{quota.remaining} remaining</p>
      )}
      {!user ? (
        <Link href="/login?next=/generate" className="text-xs text-muted hover:text-ink">
          Sign in to keep Studio
        </Link>
      ) : null}
    </div>
  );
}

export function LimitReached() {
  const { quota, user } = useQuota();

  const upgrade = () => {
    if (!user) {
      window.location.href = "/login?next=/generate";
      return;
    }
    updateProfile({ plan: "studio" });
    toast.success("Studio unlocked on this device. You can generate up to 25 certificates.");
  };

  return (
    <div className="rounded-[28px] border border-line bg-surface px-6 py-12 text-center shadow-lift">
      <p className="eyebrow text-wax">Limit reached</p>
      <h2 className="mt-3 font-serif text-3xl tracking-tight">
        {quota.used} of {quota.limit} on {planLabel(quota.plan)}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        {quota.plan === "free"
          ? "Free includes three certificates. Studio raises the cap to 25. Keys still never leave this browser."
          : "Studio tops out at 25 certificates on this device. That is the ceiling for this demo."}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {quota.plan === "free" ? (
          <Button variant="wax" onClick={upgrade}>
            Upgrade to Studio
          </Button>
        ) : null}
        <Link href="/pricing" className={cn(buttonVariants({ variant: "outline" }))}>
          Compare plans
        </Link>
      </div>
    </div>
  );
}
