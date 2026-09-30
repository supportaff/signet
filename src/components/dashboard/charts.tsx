import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-[28px] border border-line bg-surface p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-medium">{title}</h2>
        {hint ? <p className="shrink-0 text-xs text-muted">{hint}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 rounded-3xl border border-line bg-surface p-4 sm:p-5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl leading-none sm:text-4xl">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function BarList({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const peak = Math.max(1, ...items.map((item) => item.value));
  if (items.every((item) => item.value === 0)) {
    return <p className="text-sm text-muted">Nothing to chart yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{item.label}</span>
            <span className="shrink-0 text-muted">{item.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.value / peak) * 100}%`,
                background: item.color,
                minWidth: item.value ? 6 : 0,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DonutChart({
  parts,
  center,
}: {
  parts: { label: string; value: number; color: string }[];
  center: string;
}) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const summary = parts.map((part) => `${part.label} ${part.value}`).join(", ");

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <svg viewBox="0 0 120 120" className="h-36 w-36 shrink-0" role="img" aria-label={summary || "Empty chart"}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--line)" strokeWidth="14" />
        {total
          ? parts.map((part) => {
              const length = (part.value / total) * circumference;
              const dash = `${length} ${circumference - length}`;
              const circle = (
                <circle
                  key={part.label}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={part.color}
                  strokeWidth="14"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 60 60)"
                />
              );
              offset += length;
              return circle;
            })
          : null}
        <text x="60" y="58" textAnchor="middle" fill="var(--ink)" fontSize="16" fontFamily="serif">
          {center}
        </text>
        <text x="60" y="72" textAnchor="middle" fill="var(--muted)" fontSize="7">
          total
        </text>
      </svg>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1">
        {parts.map((part) => (
          <li key={part.label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: part.color }} />
              <span className="truncate">{part.label}</span>
            </span>
            <span className="text-muted">{part.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrendChart({
  series,
  color = "var(--wax)",
  label,
}: {
  series: { date: string; count: number }[];
  color?: string;
  label: string;
}) {
  if (!series.length || series.every((item) => item.count === 0)) {
    return <p className="text-sm text-muted">No activity in this window.</p>;
  }
  const width = 320;
  const height = 112;
  const padX = 8;
  const padY = 10;
  const peak = Math.max(1, ...series.map((item) => item.count));
  const step = series.length > 1 ? (width - padX * 2) / (series.length - 1) : 0;
  const points = series.map((item, index) => {
    const x = padX + index * step;
    const y = height - padY - (item.count / peak) * (height - padY * 2);
    return { ...item, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${points[0]?.x ?? padX},${height - padY} ${line} ${points.at(-1)?.x ?? padX},${height - padY}`;
  const every = series.length > 20 ? 6 : series.length > 10 ? 4 : 2;
  const summary = `${label}. Peak ${peak}.`;

  return (
    <svg viewBox={`0 0 ${width} ${height + 18}`} className="h-44 w-full sm:h-52" role="img" aria-label={summary}>
      {[0.25, 0.5, 0.75, 1].map((mark) => {
        const y = height - padY - mark * (height - padY * 2);
        return <line key={mark} x1={padX} x2={width - padX} y1={y} y2={y} stroke="var(--line)" strokeWidth="0.6" />;
      })}
      <polygon points={area} fill={color} opacity="0.16" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point) => (
        <circle key={point.date} cx={point.x} cy={point.y} r={point.count ? 2.1 : 0} fill={color}>
          <title>{`${point.date}: ${point.count}`}</title>
        </circle>
      ))}
      {points.map((point, index) =>
        index % every === 0 || index === points.length - 1 ? (
          <text key={`${point.date}-label`} x={point.x} y={height + 12} textAnchor="middle" fill="var(--muted)" fontSize="7">
            {point.date.slice(5)}
          </text>
        ) : null,
      )}
    </svg>
  );
}
