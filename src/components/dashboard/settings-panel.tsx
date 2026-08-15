"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useQuota } from "@/hooks/use-quota";
import { openBillingPortal, startCheckout } from "@/lib/billing-client";
import { updateProfile } from "@/lib/auth";
import { clearHistory } from "@/lib/history";
import { PLAN_LIMITS, nextPlan, planLabel } from "@/lib/plans";

export function SettingsPanel() {
  const { user, isAuthenticated } = useAuth();
  const { quota } = useQuota();
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const onSave = (event: FormEvent) => {
    event.preventDefault();
    updateProfile({ name });
    toast.success("Display name updated on this device.");
  };

  const checkout = async (plan: "plus" | "studio") => {
    if (!isAuthenticated || user?.id === "guest") {
      window.location.href = "/login?next=/dashboard/settings";
      return;
    }
    setBusy(true);
    try {
      await startCheckout(plan);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Settings</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Signed-in users are stored in Supabase. Plans change when Dodo Payments confirms a subscription.
          Private keys are still never uploaded.
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-4 rounded-[28px] border border-line bg-surface p-6">
        <div>
          <Label htmlFor="name">Display name</Label>
          <Input id="name" className="mt-1.5 max-w-md" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input className="mt-1.5 max-w-md" value={user?.email ?? ""} disabled />
        </div>
        <div>
          <Label>Plan</Label>
          <p className="mt-1.5 text-sm text-ink-soft">
            {planLabel(quota.plan)} · {quota.used} of {quota.limit} certificates used
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {nextPlan(quota.plan) ? (
              <Button
                type="button"
                variant="wax"
                size="sm"
                disabled={busy}
                onClick={() => checkout(nextPlan(quota.plan)!)}
              >
                Upgrade to {planLabel(nextPlan(quota.plan)!)} ({PLAN_LIMITS[nextPlan(quota.plan)!]} certs)
              </Button>
            ) : null}
            {quota.plan === "free" ? (
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => checkout("studio")}>
                Studio · $12
              </Button>
            ) : null}
            {quota.plan !== "free" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await openBillingPortal();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Portal unavailable.");
                  }
                }}
              >
                Manage billing
              </Button>
            ) : null}
          </div>
        </div>
        <Button type="submit" variant="outline">
          Save changes
        </Button>
      </form>

      <section className="rounded-[28px] border border-line bg-surface p-6">
        <h2 className="font-medium">Local history</h2>
        <p className="mt-2 text-sm text-muted">
          Clears metadata from this browser. Certificates you already downloaded are unaffected —
          and we never had the private keys.
        </p>
        <Button
          variant="danger"
          className="mt-4"
          onClick={() => {
            clearHistory();
            toast.success("Local metadata cleared.");
          }}
        >
          Clear metadata history
        </Button>
      </section>
    </div>
  );
}
