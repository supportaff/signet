"use client";

import Link from "next/link";
import { FileKey2, Plus, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useHistory } from "@/hooks/use-history";
import { useQuota } from "@/hooks/use-quota";
import { certTypeLabel } from "@/lib/cert/types";
import { deleteHistoryItem } from "@/lib/history";
import { planLabel } from "@/lib/plans";
import { cn, formatDate, formatDateShort, hexColon } from "@/lib/utils";

export function DashboardOverview() {
  const { user } = useAuth();
  const { items, ready } = useHistory();
  const { quota } = useQuota();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">
            Hello{user ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            This list is metadata only — common names, dates, fingerprints.
            Private keys were never written here.
          </p>
        </div>
        <Link
          href={quota.allowed ? "/generate" : "/pricing"}
          className={cn(buttonVariants({ variant: "wax" }))}
        >
          <Plus className="h-4 w-4" />
          {quota.allowed ? "New certificate" : "Upgrade for more"}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Generated"
          value={`${quota.used} / ${quota.limit}`}
          hint={planLabel(quota.plan)}
          icon={FileKey2}
        />
        <Stat
          label="Remaining"
          value={String(quota.remaining)}
          hint={quota.allowed ? "On this plan" : "Limit reached"}
          icon={ShieldCheck}
        />
        <Stat
          label="Keys on server"
          value="0"
          hint="By architecture"
          icon={ShieldCheck}
        />
      </div>

      <section className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-medium">Generation history</h2>
          <Badge>Metadata only</Badge>
        </div>
        {!ready ? (
          <div className="h-40 skeleton" />
        ) : items.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-serif text-2xl">No local records yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Generate a certificate and SelfSignedCert will remember the name and fingerprint on this device — never the key.
            </p>
            <Link href="/generate" className={cn(buttonVariants({ variant: "outline" }), "mt-5")}>
              Generate your first
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Identity</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">Expires</th>
                  <th className="px-5 py-3 font-medium">Fingerprint</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="px-5 py-4">
                      <p className="font-medium">{item.commonName}</p>
                      <p className="text-xs text-muted">{item.sans.slice(0, 2).join(", ")}</p>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{certTypeLabel(item.type)}</td>
                    <td className="px-5 py-4 text-ink-soft">{formatDate(item.createdAt)}</td>
                    <td className="px-5 py-4 text-ink-soft">
                      {item.notAfter ? formatDateShort(item.notAfter) : "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-muted">
                      {item.fingerprintSha256
                        ? hexColon(item.fingerprintSha256).slice(0, 23)
                        : "CSR"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="text-xs text-muted hover:text-danger"
                        onClick={() => deleteHistoryItem(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof FileKey2;
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <Icon className="h-4 w-4 text-wax" />
      <p className="mt-4 font-serif text-3xl">{value}</p>
      <p className="mt-1 text-sm text-muted">
        {label}
        {hint ? ` · ${hint}` : ""}
      </p>
    </div>
  );
}
