"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/hooks/use-account";
import { planLabel } from "@/lib/plans";
import type { SignetAccount, SignetLoginEvent, TrackingStatus } from "@/lib/users";
import { formatDate } from "@/lib/utils";

function statusTone(status?: string) {
  if (status === "active") return "sage" as const;
  if (status === "canceled" || status === "expired") return "danger" as const;
  return "gold" as const;
}

export function UsersPanel() {
  const { isAdmin, adminConfigured, ready } = useAccount();
  const [users, setUsers] = useState<SignetAccount[]>([]);
  const [logins, setLogins] = useState<SignetLoginEvent[]>([]);
  const [tracking, setTracking] = useState<TrackingStatus>("not_configured");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/admin/users");
    const data = (await response.json()) as {
      error?: string;
      tracking?: TrackingStatus;
      users?: SignetAccount[];
      logins?: SignetLoginEvent[];
    };
    if (!response.ok) {
      setError(data.error || "Could not load users.");
      return;
    }
    setError(null);
    setTracking(data.tracking ?? "ok");
    setUsers(data.users ?? []);
    setLogins(data.logins ?? []);
  };

  useEffect(() => {
    if (!ready || !isAdmin) return;
    void load().catch(() => setError("Could not load users."));
  }, [ready, isAdmin]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) =>
      [user.email, user.name, user.plan, user.plan_status, user.clerk_id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [users, query]);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this account and its login history from Supabase?")) return;
    setBusyId(id);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Delete failed.");
      toast.success("Account deleted.");
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  };

  if (!ready) {
    return <div className="h-40 rounded-[28px] border border-line skeleton" />;
  }

  if (!adminConfigured || !isAdmin) {
    return (
      <div className="rounded-[28px] border border-line bg-surface p-8">
        <p className="eyebrow">Users</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Admin only.</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          The user list is stored in Supabase. Add{" "}
          <span className="font-mono">ADMIN_EMAILS=you@gmail.com</span> in Vercel and{" "}
          <span className="font-mono">.env.local</span>, then sign in with that Google account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Users</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Logins and plans.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Email, last login, pricing tier, and plan status from Supabase. Private keys are never stored.
        </p>
      </div>

      {tracking === "missing_tables" || error ? (
        <div className="rounded-[28px] border border-gold/30 bg-gold/10 p-6 text-sm">
          <p className="font-medium">{error || "Supabase tables are missing."}</p>
          <p className="mt-2 text-muted">
            In Supabase, open SQL and run <span className="font-mono">supabase/schema.sql</span>.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Users" value={String(users.length)} />
        <Stat
          label="Paid"
          value={String(users.filter((user) => user.plan === "plus" || user.plan === "studio").length)}
        />
        <Stat label="Recent logins" value={String(logins.length)} />
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search email, name, or plan"
      />

      <section className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Tier</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Usage</th>
                <th className="px-5 py-3 font-medium">Last login</th>
                <th className="px-5 py-3 font-medium">Logins</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    No users recorded yet. After the tables exist, the next Google sign-in will appear here.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.clerk_id} className="border-t border-line">
                    <td className="px-5 py-4">
                      <p className="font-medium">{row.name || "Unsigned name"}</p>
                      <p className="text-xs text-muted">{row.email || row.clerk_id}</p>
                    </td>
                    <td className="px-5 py-4">{planLabel(row.plan)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={statusTone(row.plan_status)}>{row.plan_status || "active"}</Badge>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{row.certs_used}</td>
                    <td className="px-5 py-4 text-ink-soft">
                      {row.last_login_at ? formatDate(row.last_login_at) : "—"}
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{row.login_count || 0}</td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busyId === row.clerk_id}
                        onClick={() => void remove(row.clerk_id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {logins.length ? (
        <section className="rounded-[28px] border border-line bg-surface p-6">
          <h2 className="font-medium">Recent logins</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {logins.map((login) => (
              <li key={login.id} className="flex justify-between gap-4 text-ink-soft">
                <span>{login.email || login.clerk_id}</span>
                <span className="text-muted">{formatDate(login.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <p className="font-serif text-3xl">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
