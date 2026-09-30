"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { DashboardOverview } from "@/components/dashboard/overview";
import { useAccount } from "@/hooks/use-account";
import { cn } from "@/lib/utils";

const UsersPanel = dynamic(
  () => import("@/components/dashboard/users-panel").then((mod) => mod.UsersPanel),
  { loading: () => <div className="h-40 rounded-[28px] border border-line skeleton" /> },
);

export function DashboardHome() {
  const { isAdmin } = useAccount();
  const [tab, setTab] = useState<"analytics" | "mine">("analytics");

  if (!isAdmin) return <DashboardOverview />;

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Dashboard views" className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1">
        {(
          [
            ["analytics", "Site analytics"],
            ["mine", "My certificates"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={cn(
              "rounded-full px-3 py-2 text-sm",
              tab === id ? "bg-ink text-bg" : "text-ink-soft hover:bg-bg-muted",
            )}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "analytics" ? <UsersPanel embedded /> : <DashboardOverview />}
    </div>
  );
}
