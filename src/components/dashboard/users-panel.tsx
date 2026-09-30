"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminVisuals, type AdminMetrics } from "@/components/dashboard/admin-visuals";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAccount } from "@/hooks/use-account";
import { downloadCsv } from "@/lib/csv";
import { planLabel } from "@/lib/plans";
import type {
  SignetAccount,
  SignetCertEvent,
  SignetLoginEvent,
  SignetPaymentEvent,
  TrackingStatus,
} from "@/lib/users";
import { cn, formatDate } from "@/lib/utils";

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
  metrics?: AdminMetrics;
};

const PLAN_FILTERS = ["all", "free", "plus", "studio"] as const;

export function UsersPanel({ embedded = false }: { embedded?: boolean }) {
  const { isAdmin, ready } = useAccount();
  const [users, setUsers] = useState<SignetAccount[]>([]);
  const [logins, setLogins] = useState<SignetLoginEvent[]>([]);
  const [payments, setPayments] = useState<SignetPaymentEvent[]>([]);
  const [certificates, setCertificates] = useState<SignetCertEvent[]>([]);
  const [metrics, setMetrics] = useState<AdminPayload["metrics"] | null>(null);
  const [tracking, setTracking] = useState<TrackingStatus>("not_configured");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<(typeof PLAN_FILTERS)[number]>("all");
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
    return users.filter((user) => {
      if (planFilter !== "all" && user.plan !== planFilter) return false;
      if (!needle) return true;
      return [user.email, user.name, user.plan, user.plan_status, user.auth_id, user.dodo_customer_id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [users, query, planFilter]);

  const exportUsers = () => {
    if (!filtered.length) {
      toast.error("No users to export.");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `selfsignedcert-users-${stamp}.csv`,
      [
        "name",
        "email",
        "plan",
        "status",
        "certs_used",
        "login_count",
        "last_login_at",
        "created_at",
        "auth_id",
        "dodo_customer_id",
        "dodo_subscription_id",
      ],
      filtered.map((row) => [
        row.name || "",
        row.email || "",
        row.plan || "",
        row.plan_status || "active",
        String(row.certs_used ?? 0),
        String(row.login_count ?? 0),
        row.last_login_at || "",
        row.created_at || "",
        row.auth_id || "",
        row.dodo_customer_id || "",
        row.dodo_subscription_id || "",
      ]),
    );
    toast.success(`Exported ${filtered.length} users.`);
  };

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

  if (!isAdmin) {
    if (embedded || !ready) {
      if (embedded) return null;
      return (
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="h-40 rounded-[28px] border border-line skeleton" />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="eyebrow">404</p>
        <h1 className="display mt-3 text-5xl">This page was never issued.</h1>
        <p className="mt-4 text-ink-soft">
          No certificate, and no route, lives here. Try the generator or go home.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Home
          </Link>
          <Link href="/generate" className={cn(buttonVariants({ variant: "wax" }))}>
            Generate
          </Link>
        </div>
      </div>
    );
  }

  const body = (
    <div id="admin" className="space-y-6">
      <div className="min-w-0">
        <p className="eyebrow">Admin analytics</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">Users, signups, plans.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Account metadata only. Certificates and private keys are never stored.
        </p>
      </div>

      {tracking === "missing_tables" || error ? (
        <div className="rounded-[28px] border border-gold/30 bg-gold/10 p-6 text-sm">
          <p className="font-medium">{error || "Supabase tables are missing."}</p>
        </div>
      ) : null}

      <AdminVisuals metrics={metrics ?? null} />

      <div className="flex flex-col gap-3">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {PLAN_FILTERS.map((plan) => (
            <button
              key={plan}
              type="button"
              aria-pressed={planFilter === plan}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm capitalize",
                planFilter === plan ? "border-ink bg-ink text-bg" : "border-line text-ink-soft",
              )}
              onClick={() => setPlanFilter(plan)}
            >
              {plan}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search email, name, plan, or customer id"
          />
          <Button variant="outline" className="w-full shrink-0 sm:w-auto" disabled={!filtered.length} onClick={exportUsers}>
            <Download className="h-4 w-4" />
            Export CSV ({filtered.length})
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="flex flex-col gap-1 border-b border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2 className="font-medium">Users and plan details</h2>
          <p className="text-xs text-muted">{filtered.length} shown</p>
        </div>
        <ul className="divide-y divide-line lg:hidden">
          {filtered.length === 0 ? (
            <li className="px-4 py-12 text-center text-sm text-muted">No users recorded yet.</li>
          ) : (
            filtered.map((row) => (
              <li key={row.auth_id} className="space-y-3 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.name || "No name"}</p>
                    <p className="truncate text-xs text-muted">{row.email || row.auth_id}</p>
                  </div>
                  <Badge tone={statusTone(row.plan_status)}>{row.plan_status || "active"}</Badge>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-muted">Plan</dt>
                    <dd>{planLabel(row.plan)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Certs</dt>
                    <dd>{row.certs_used}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Logins</dt>
                    <dd>{row.login_count || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Joined</dt>
                    <dd>{row.created_at ? formatDate(row.created_at) : "—"}</dd>
                  </div>
                </dl>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  disabled={busyId === row.auth_id}
                  onClick={() => void remove(row.auth_id)}
                >
                  Delete
                </Button>
              </li>
            ))
          )}
        </ul>
        <div className="hidden overflow-x-auto lg:block">
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
        <div className="border-b border-line px-4 py-4 sm:px-5">
          <h2 className="font-medium">Transactions</h2>
        </div>
        <ul className="divide-y divide-line md:hidden">
          {payments.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-muted">
              No checkout events recorded. Older Plus and Studio payments still show here.
            </li>
          ) : (
            payments.map((row) => (
              <li key={row.id} className="space-y-2 px-4 py-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{row.event_type}</p>
                  <Badge tone={statusTone(row.status || undefined)}>{row.status || "—"}</Badge>
                </div>
                <p className="text-xs text-muted">{formatDate(row.created_at)} · {row.plan || "no plan"}</p>
                <p className="truncate font-mono text-[11px] text-muted">
                  {row.dodo_payment_id || row.dodo_subscription_id || row.auth_id || "—"}
                </p>
              </li>
            ))
          )}
        </ul>
        <div className="hidden overflow-x-auto md:block">
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
                    No checkout events recorded. Older Plus and Studio payments still show here.
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
                <li key={login.id} className="flex items-baseline justify-between gap-3 text-ink-soft">
                  <span className="min-w-0 truncate">{login.email || login.auth_id}</span>
                  <span className="shrink-0 text-xs text-muted">{formatDate(login.created_at)}</span>
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
                <li key={item.id} className="flex items-baseline justify-between gap-3 text-ink-soft">
                  <span className="min-w-0 truncate">
                    {item.common_name || "certificate"} · {item.cert_type}
                  </span>
                  <span className="shrink-0 text-xs text-muted">{formatDate(item.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </div>
  );

  if (embedded) return body;
  return <DashboardShell>{body}</DashboardShell>;
}


