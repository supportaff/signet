"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/hooks/use-account";
import { planLabel } from "@/lib/plans";
import type {
  SignetAccount,
  SignetCertEvent,
  SignetLoginEvent,
  SignetPaymentEvent,
  TrackingStatus,
} from "@/lib/users";
import { formatDate } from "@/lib/utils";

function statusTone(status?: string) {
  if (status === "active" || status === "succeeded") return "sage" as const;
  if (status === "canceled" || status === "expired" || status === "failed") return "danger" as const;
  return "gold" as const;
}

type AdminPayload = {
  error?: string;
  tracking?: TrackingStatus;
  users?: SignetAccount[];
  logins?: SignetLoginEvent[];
  payments?: SignetPaymentEvent[];
  certificates?: SignetCertEvent[];
  metrics?: {
    users: number;
    free: number;
    plus: number;
    studio: number;
    active: number;
    canceled: number;
    paid: number;
    certsThisMonth: number;
    loginsThisMonth: number;
    transactions: number;
    lifetimeCerts: number;
  };
};

export function UsersPanel() {
  const { isAdmin, ready } = useAccount();
  const [users, setUsers] = useState<SignetAccount[]>([]);
  const [logins, setLogins] = useState<SignetLoginEvent[]>([]);
  const [payments, setPayments] = useState<SignetPaymentEvent[]>([]);
  const [certificates, setCertificates] = useState<SignetCertEvent[]>([]);
  const [metrics, setMetrics] = useState<AdminPayload["metrics"] | null>(null);
  const [tracking, setTracking] = useState<TrackingStatus>("not_configured");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/admin/users");
    const data = (await response.json()) as AdminPayload;
    if (!response.ok) {
      setError(data.error || "Could not load admin data.");
      return;
    }
    setError(null);
    setTracking(data.tracking ?? "ok");
    setUsers(data.users ?? []);
    setLogins(data.logins ?? []);
    setPayments(data.payments ?? []);
    setCertificates(data.certificates ?? []);
    setMetrics(data.metrics ?? null);
  };

  useEffect(() => {
    if (!ready || !isAdmin) return;
    void load().catch(() => setError("Could not load admin data."));
  }, [ready, isAdmin]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) =>
      [user.email, user.name, user.plan, user.plan_status, user.auth_id, user.dodo_customer_id]
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

  if (!isAdmin) {
    return (
      <div className="rounded-[28px] border border-line bg-surface p-8">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Restricted.</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Only prakashmurthy5199@gmail.com can open this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Users, plans, transactions.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Visible only to prakashmurthy5199@gmail.com. Metadata only — no private keys.
        </p>
      </div>

      {tracking === "missing_tables" || error ? (
        <div className="rounded-[28px] border border-gold/30 bg-gold/10 p-6 text-sm">
          <p className="font-medium">{error || "Supabase tables are missing."}</p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Users" value={String(metrics?.users ?? users.length)} />
        <Stat label="Paid (Plus + Studio)" value={String(metrics?.paid ?? 0)} />
        <Stat label="Active plans" value={String(metrics?.active ?? 0)} />
        <Stat label="Canceled / expired" value={String(metrics?.canceled ?? 0)} />
        <Stat label="Free" value={String(metrics?.free ?? 0)} />
        <Stat label="Plus" value={String(metrics?.plus ?? 0)} />
        <Stat label="Studio" value={String(metrics?.studio ?? 0)} />
        <Stat label="Certs this month" value={String(metrics?.certsThisMonth ?? 0)} />
        <Stat label="Logins this month" value={String(metrics?.loginsThisMonth ?? 0)} />
        <Stat label="Transactions" value={String(metrics?.transactions ?? payments.length)} />
        <Stat label="Lifetime certs" value={String(metrics?.lifetimeCerts ?? 0)} />
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search email, name, plan, or Dodo customer"
      />

      <section className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-medium">Users and plan details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Lifetime</th>
                <th className="px-5 py-3 font-medium">Last login</th>
                <th className="px-5 py-3 font-medium">Logins</th>
                <th className="px-5 py-3 font-medium">Dodo</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted">
                    No users recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.auth_id} className="border-t border-line">
                    <td className="px-5 py-4">
                      <p className="font-medium">{row.name || "No name"}</p>
                      <p className="text-xs text-muted">{row.email || row.auth_id}</p>
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
                    <td className="px-5 py-4 font-mono text-[11px] text-muted">
                      {row.dodo_subscription_id || row.dodo_customer_id || "—"}
                    </td>
                    <td className="px-5 py-4 text-ink-soft">
                      {row.created_at ? formatDate(row.created_at) : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busyId === row.auth_id}
                        onClick={() => void remove(row.auth_id)}
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

      <section className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-medium">Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Payment / sub</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    No Dodo webhook events yet. A Plus or Studio checkout will appear here.
                  </td>
                </tr>
              ) : (
                payments.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-5 py-4 text-ink-soft">{formatDate(row.created_at)}</td>
                    <td className="px-5 py-4">{row.event_type}</td>
                    <td className="px-5 py-4">{row.plan || "—"}</td>
                    <td className="px-5 py-4">
                      <Badge tone={statusTone(row.status || undefined)}>{row.status || "—"}</Badge>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-muted">{row.auth_id || "—"}</td>
                    <td className="px-5 py-4 font-mono text-[11px] text-muted">
                      {row.dodo_payment_id || row.dodo_subscription_id || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-line bg-surface p-6">
          <h2 className="font-medium">Recent logins</h2>
          {logins.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No logins recorded.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {logins.map((login) => (
                <li key={login.id} className="flex justify-between gap-4 text-ink-soft">
                  <span>{login.email || login.auth_id}</span>
                  <span className="text-muted">{formatDate(login.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-[28px] border border-line bg-surface p-6">
          <h2 className="font-medium">Recent certificates</h2>
          {certificates.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No generation metadata yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {certificates.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 text-ink-soft">
                  <span>
                    {item.common_name || "certificate"} · {item.cert_type}
                  </span>
                  <span className="text-muted">{formatDate(item.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
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
