"use client";

import { BarList, ChartCard, DonutChart, KpiCard, TrendChart } from "@/components/dashboard/charts";

export type DayCount = { date: string; count: number };

export type AdminMetrics = {
  users: number;
  free: number;
  plus: number;
  studio: number;
  active: number;
  canceled: number;
  paid: number;
  paidPercent: number;
  signupsToday: number;
  signups7d: number;
  signups30d: number;
  certsThisMonth: number;
  loginsThisMonth: number;
  paymentsThisMonth: number;
  transactions: number;
  lifetimeCerts: number;
  signupSeries: DayCount[];
  loginSeries: DayCount[];
  certSeries: DayCount[];
  certTypes: { label: string; count: number }[];
};

const PLAN_COLOR = {
  Free: "color-mix(in oklab, var(--ink) 28%, transparent)",
  Plus: "var(--gold)",
  Studio: "var(--wax)",
};

const TYPE_COLORS = ["var(--wax)", "var(--sage)", "var(--gold)", "var(--ink)", "var(--danger)"];

export function AdminVisuals({ metrics }: { metrics: AdminMetrics | null }) {
  const plans = [
    { label: "Free", value: metrics?.free ?? 0, color: PLAN_COLOR.Free },
    { label: "Plus", value: metrics?.plus ?? 0, color: PLAN_COLOR.Plus },
    { label: "Studio", value: metrics?.studio ?? 0, color: PLAN_COLOR.Studio },
  ];
  const certTypes = (metrics?.certTypes ?? []).map((item, index) => ({
    label: item.label,
    value: item.count,
    color: TYPE_COLORS[index % TYPE_COLORS.length] ?? "var(--wax)",
  }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard label="Accounts" value={String(metrics?.users ?? 0)} hint={`${metrics?.signupsToday ?? 0} joined today`} />
        <KpiCard label="Signups, 7 days" value={String(metrics?.signups7d ?? 0)} hint={`${metrics?.signups30d ?? 0} in 30 days`} />
        <KpiCard label="Certs this month" value={String(metrics?.certsThisMonth ?? 0)} hint={`${metrics?.lifetimeCerts ?? 0} lifetime`} />
        <KpiCard label="Logins this month" value={String(metrics?.loginsThisMonth ?? 0)} hint={`${metrics?.paymentsThisMonth ?? 0} payments`} />
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <ChartCard title="Signups" hint="30 UTC days" className="lg:col-span-3">
          <TrendChart series={metrics?.signupSeries ?? []} label="Daily signups" />
        </ChartCard>
        <ChartCard title="Plans" hint={`${metrics?.paidPercent ?? 0}% older paid`} className="lg:col-span-2">
          <DonutChart parts={plans} center={String(metrics?.users ?? 0)} />
        </ChartCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <ChartCard title="Logins" hint="30 UTC days">
          <TrendChart series={metrics?.loginSeries ?? []} color="var(--sage)" label="Daily logins" />
        </ChartCard>
        <ChartCard title="Certificates recorded" hint="30 UTC days">
          <TrendChart series={metrics?.certSeries ?? []} color="var(--gold)" label="Daily certificates" />
        </ChartCard>
        <ChartCard title="Certificate types" hint="Same 30 days">
          {certTypes.length ? (
            <BarList items={certTypes} />
          ) : (
            <p className="text-sm text-muted">No certificate metadata in this window.</p>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Active accounts" value={String(metrics?.active ?? 0)} />
        <KpiCard label="Canceled or expired" value={String(metrics?.canceled ?? 0)} />
        <KpiCard label="Payments logged" value={String(metrics?.transactions ?? 0)} hint="Historical checkout events" />
      </div>
    </div>
  );
}
