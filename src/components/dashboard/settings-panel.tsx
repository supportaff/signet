"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useQuota } from "@/hooks/use-quota";
import { updateProfile } from "@/lib/auth";
import { clearHistory } from "@/lib/history";
import { PLAN_LIMITS, planLabel } from "@/lib/plans";

export function SettingsPanel() {
  const { user } = useAuth();
  const { quota } = useQuota();
  const [name, setName] = useState(user?.name ?? "");

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const onSave = (event: FormEvent) => {
    event.preventDefault();
    updateProfile({ name });
    toast.success("Profile updated on this device.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Settings</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          These preferences stay in local storage. Signet still has no copy of your keys.
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
          {quota.plan === "free" ? (
            <Button
              type="button"
              variant="wax"
              size="sm"
              className="mt-3"
              onClick={() => {
                updateProfile({ plan: "studio" });
                toast.success(`Studio unlocked. Cap is now ${PLAN_LIMITS.studio} certificates.`);
              }}
            >
              Upgrade to Studio (25 certs)
            </Button>
          ) : null}
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
