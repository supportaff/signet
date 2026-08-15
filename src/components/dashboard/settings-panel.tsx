"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "@/hooks/use-account";
import { useQuota } from "@/hooks/use-quota";
import { openBillingPortal, startCheckout } from "@/lib/billing-client";
import { clearSession, updateProfile } from "@/lib/auth";
import { clearHistory } from "@/lib/history";
import { PLAN_LIMITS, nextPlan, planLabel } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

function statusTone(status?: string) {
  if (status === "active") return "sage" as const;
  if (status === "canceled" || status === "expired") return "danger" as const;
  return "gold" as const;
}

export function SettingsPanel() {
  const router = useRouter();
  const { user, account, tracking, isAuthenticated } = useAccount();
  const { quota } = useQuota();
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const deleteAccount = async () => {
    if (!user?.email) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Could not delete the account.");
      }
      clearHistory();
      clearSession();
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Account deleted.");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the account.");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Settings</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Your Google login, plan, and usage live in Supabase. Private keys are still never uploaded.
        </p>
      </div>

      {tracking === "missing_tables" ? (
        <div className="rounded-[28px] border border-gold/30 bg-gold/10 p-6 text-sm">
          <p className="font-medium">Supabase tables are not created yet.</p>
          <p className="mt-2 text-muted">
            SelfSignedCert needs its dedicated Supabase project tables. Run{" "}
            <span className="font-mono">supabase/schema.sql</span>, then sign in once more
            to record this login.
          </p>
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <StatusCard
          label="Sign-in"
          value={user?.id === "guest" ? "Guest" : "Google"}
          hint={user?.email || "No email on this session"}
        />
        <StatusCard
          label="Pricing tier"
          value={planLabel(account?.plan ?? quota.plan)}
          hint={`${quota.used} of ${quota.limit} certificates used`}
          badge={account?.plan_status || "active"}
        />
        <StatusCard
          label="Last login"
          value={account?.last_login_at ? formatDate(account.last_login_at) : "This session"}
          hint={account ? `${account.login_count || 1} recorded login${account.login_count === 1 ? "" : "s"}` : "Not stored yet"}
        />
      </section>

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
          <Label>Plan status</Label>
          <p className="mt-1.5 text-sm text-ink-soft">
            {planLabel(quota.plan)} · {account?.plan_status || "active"} · {quota.used} of {quota.limit}{" "}
            certificates used this month
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

      {user && user.id !== "guest" ? (
        <section className="rounded-[28px] border border-danger/30 bg-surface p-6">
          <h2 className="font-medium text-danger">Delete account</h2>
          <p className="mt-2 text-sm text-muted">
            Removes your SelfSignedCert row, login history, and usage from Supabase. Downloaded certificates
            stay on your machine. This cannot be undone.
          </p>
          <Label htmlFor="confirm-delete" className="mt-4">
            Type {user.email} to confirm
          </Label>
          <Input
            id="confirm-delete"
            className="mt-1.5 max-w-md"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder={user.email}
          />
          <Button
            variant="danger"
            className="mt-4"
            disabled={deleting || confirm.trim().toLowerCase() !== user.email.toLowerCase()}
            onClick={() => void deleteAccount()}
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </Button>
        </section>
      ) : null}
    </div>
  );
}

function StatusCard({
  label,
  value,
  hint,
  badge,
}: {
  label: string;
  value: string;
  hint: string;
  badge?: string;
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
        {badge ? <Badge tone={statusTone(badge)}>{badge}</Badge> : null}
      </div>
      <p className="mt-3 font-serif text-2xl tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </div>
  );
}
