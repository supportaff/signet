import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsPanel } from "@/components/dashboard/settings-panel";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <DashboardShell>
      <SettingsPanel />
    </DashboardShell>
  );
}
