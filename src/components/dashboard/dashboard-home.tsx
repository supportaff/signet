"use client";

import dynamic from "next/dynamic";
import { DashboardOverview } from "@/components/dashboard/overview";
import { useAccount } from "@/hooks/use-account";

const UsersPanel = dynamic(
  () => import("@/components/dashboard/users-panel").then((mod) => mod.UsersPanel),
  { loading: () => <div className="h-40 rounded-[28px] border border-line skeleton" /> },
);

export function DashboardHome() {
  const { isAdmin } = useAccount();

  if (!isAdmin) return <DashboardOverview />;

  return (
    <div className="space-y-10">
      <UsersPanel embedded />
      <DashboardOverview />
    </div>
  );
}
