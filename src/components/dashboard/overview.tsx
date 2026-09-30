"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import { BarList, ChartCard, DonutChart, KpiCard, TrendChart } from "@/components/dashboard/charts";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useHistory } from "@/hooks/use-history";
import { certTypeLabel, type CertType } from "@/lib/cert/types";
import { deleteHistoryItem } from "@/lib/history";
import { cn, formatDate, formatDateShort, hexColon } from "@/lib/utils";

const TYPE_COLORS = ["var(--wax)", "var(--sage)", "var(--gold)", "var(--ink)", "var(--danger)"];

function daysUntil(iso: string | null) {
  if (!iso) return null;
  return Math.ceil((+new Date(iso) - Date.now()) / 86_400_000);
}

export function DashboardOverview() {
  const { user } = useAuth();
  const { items, ready } = useHistory();
  const firstName = user?.name.split(" ")[0];

  const visuals = useMemo(() => {
    const types = new Map<CertType, number>();
    const keys = new Map<string, number>();
    const expiry = { expired: 0, soon: 0, quarter: 0, later: 0, open: 0 };
    const series = Array.from({ length: 14 }, (_, index) => {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (13 - index));
      const start = day.getTime();
      return { date: day.toISOString().slice(0, 10), start, count: 0 };
    });

    for (const item of items) {
      types.set(item.type, (types.get(item.type) ?? 0) + 1);
      keys.set(item.keyAlgorithm, (keys.get(item.keyAlgorithm) ?? 0) + 1);
      const left = daysUntil(item.notAfter);
      if (left === null) expiry.open += 1;
      else if (left < 0) expiry.expired += 1;
      else if (left <= 30) expiry.soon += 1;
      else if (left <= 90) expiry.quarter += 1;
      else expiry.later += 1;
      const created = +new Date(item.createdAt);
      const bucket = series.find((entry) => created >= entry.start && created < entry.start + 86_400_000);
      if (bucket) bucket.count += 1;
    }

    return {
      types: [...types.entries()].map(([type, value], index) => ({
        label: certTypeLabel(type),
        value,
        color: TYPE_COLORS[index % TYPE_COLORS.length] ?? "var(--wax)",
      })),
      keys: [...keys.entries()].map(([label, value], index) => ({
        label,
        value,
        color: index === 0 ? "var(--wax)" : "var(--gold)",
      })),
      expiry,
      series: series.map(({ date, count }) => ({ date, count })),
      soon: expiry.soon,
    };
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
            Hello{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Names, dates, and fingerprints from this browser. Private keys were never written here.
          </p>
        </div>
        <Link href="/generate" className={cn(buttonVariants({ variant: "wax" }), "w-full sm:w-auto")}>
          <Plus className="h-4 w-4" />
          New certificate
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="On this device" value={ready ? String(items.length) : "–"} hint="Local records" />
        <KpiCard label="Expiring in 30 days" value={ready ? String(visuals.soon) : "–"} hint="Still valid" />
        <KpiCard label="Price" value="Free" hint="No monthly cap" />
        <KpiCard label="Keys on server" value="0" hint="By architecture" />
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <ChartCard title="Forged on this device" hint="14 local days" className="lg:col-span-3">
          <TrendChart series={visuals.series} label="Certificates created on this device" />
        </ChartCard>
        <ChartCard title="By type" className="lg:col-span-2">
          {visuals.types.length ? (
            <DonutChart parts={visuals.types} center={String(items.length)} />
          ) : (
            <p className="text-sm text-muted">Generate a certificate and the mix shows up here.</p>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Expiry horizon">
          <BarList
            items={[
              { label: "Expired", value: visuals.expiry.expired, color: "var(--danger)" },
              { label: "Within 30 days", value: visuals.expiry.soon, color: "var(--gold)" },
              { label: "Within 90 days", value: visuals.expiry.quarter, color: "var(--wax)" },
              { label: "Later", value: visuals.expiry.later, color: "var(--sage)" },
              { label: "No expiry (CSR)", value: visuals.expiry.open, color: "color-mix(in oklab, var(--ink) 35%, transparent)" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Key size">
          <BarList items={visuals.keys} />
        </ChartCard>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
          <h2 className="font-medium">Generation history</h2>
          <Badge>Metadata only</Badge>
        </div>
        {!ready ? (
          <div className="h-40 skeleton" />
        ) : items.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-serif text-2xl">No local records yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Generate a certificate and SelfSignedCert will remember the name and fingerprint on this device.
            </p>
            <Link href="/generate" className={cn(buttonVariants({ variant: "outline" }), "mt-5")}>
              Generate your first
            </Link>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-line md:hidden">
              {items.map((item) => (
                <li key={item.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.commonName}</p>
                      <p className="text-xs text-muted">{certTypeLabel(item.type)}</p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-xs text-muted hover:text-danger"
                      onClick={() => deleteHistoryItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted">Created</dt>
                      <dd>{formatDateShort(item.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Expires</dt>
                      <dd>{item.notAfter ? formatDateShort(item.notAfter) : "CSR"}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted">Fingerprint</dt>
                      <dd className="truncate font-mono">
                        {item.fingerprintSha256 ? hexColon(item.fingerprintSha256).slice(0, 23) : "CSR"}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
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
                      <td className="px-5 py-4 text-ink-soft">{item.notAfter ? formatDateShort(item.notAfter) : "—"}</td>
                      <td className="px-5 py-4 font-mono text-[11px] text-muted">
                        {item.fingerprintSha256 ? hexColon(item.fingerprintSha256).slice(0, 23) : "CSR"}
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
          </>
        )}
      </section>
    </div>
  );
}
