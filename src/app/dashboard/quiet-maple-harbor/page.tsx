import type { Metadata } from "next";
import { UsersPanel } from "@/components/dashboard/users-panel";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function QuietMapleHarborPage() {
  return <UsersPanel />;
}
