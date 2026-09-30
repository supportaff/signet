"use client";

type Metrics = {
  users: number;
  free: number;
  plus: number;
  studio: number;
  certsThisMonth: number;
  loginsThisMonth: number;
  paymentsThisMonth: number;
  signups7d: number;
  signups30d: number;
  paidPercent: number;
};

const PLAN_COLOR: Record<string, string> = {
  Free: "color-mix(in oklab, var(--ink) 28%, transparent)",
  Plus: "var(--gold)",
  Studio: "var(--wax)",
};

function ringBackground(parts: { label: string; value: number }[]) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  if (!total) return "var(--line)";
  let cursor = 0;
  const stops = parts.map((part) => {
    const start = cursor;
    cursor += (part.value / total) * 360;
    return `${PLAN_COLOR[part.label]} ${start}deg ${cursor}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

export function AdminVisuals({ metrics }: { metrics: Metrics | null }) {
  const parts = [
    { label: "Free", value: metrics?.free ?? 0 },
    { label: "Plus", value: metrics?.plus ?? 0 },
    { label: "Studio", value: metrics?.studio ?? 0 },
  ];
  const accounts = parts.reduce((sum, part) => sum + part.value, 0);
  const activity = [
    { label: "Certificates", value: metrics?.certsThisMonth ?? 0, className: "bg-wax" },
    { label: "Logins", value: metrics?.loginsThisMonth ?? 0, className: "bg-sage" },
    { label: "Payments", value: metrics?.paymentsThisMonth ?? 0, className: "bg-gold" },
  ];
  const peak = Math.max(1, ...activity.map((item) => item.value));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-medium">Who is on the site</h2>
          <p className="text-xs text-muted">{metrics?.paidPercent ?? 0}% on an older paid plan</p>
        </div>
        <div className="mt-5 flex items-center gap-6">
          <div
            className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
            style={{ background: ringBackground(parts) }}
            role="img"
            aria-label={`${accounts} accounts. ${parts.map((part) => `${part.label} ${part.value}`).join(", ")}.`}
          >
            <div className="grid h-[4.6rem] w-[4.6rem] place-items-center rounded-full bg-surface text-center">
              <span className="font-serif text-2xl leading-none">{accounts}</span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted">accounts</span>
            </div>
          </div>
          <ul className="grid flex-1 grid-cols-3 gap-3 text-sm">
            {parts.map((part) => (
              <li key={part.label}>
                <span className="mb-2 block h-1.5 w-8 rounded-full" style={{ background: PLAN_COLOR[part.label] }} />
                <p className="font-serif text-2xl">{part.value}</p>
                <p className="text-muted">{part.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="rounded-[28px] border border-line bg-surface p-6">
        <h2 className="font-medium">This month</h2>
        <ul className="mt-5 space-y-4">
          {activity.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted">{item.value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-bg-muted">
                <div
                  className={`h-full rounded-full ${item.className}`}
                  style={{ width: `${Math.max(item.value ? 4 : 0, (item.value / peak) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">
          {metrics?.signups7d ?? 0} signups in 7 days · {metrics?.signups30d ?? 0} in 30 days
        </p>
      </section>
    </div>
  );
}
