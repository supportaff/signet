import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UsersPanel } from "@/components/dashboard/users-panel";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function UsersPage() {
  return (
    <DashboardShell>
      <UsersPanel />
    </DashboardShell>
  );
}
