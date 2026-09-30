"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { LayoutDashboard, LogOut, Plus, Settings, Users } from "lucide-react";
import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { clearSession, isGuest } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/generate", label: "Generate", icon: Plus },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const { isAdmin } = useAccount();
  const pathname = usePathname();
  const router = useRouter();
  const nav = isAdmin
    ? [{ href: "/dashboard", label: "Admin", icon: Users }, links[1], links[2]]
    : links;

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login?next=/dashboard");
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="h-40 rounded-[28px] border border-line skeleton" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <aside className="mb-4 h-fit rounded-3xl border border-line bg-surface p-3 lg:sticky lg:top-24 lg:mb-0">
          <div className="px-2 py-2 sm:px-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted">{isGuest(user) ? "Guest session" : user.email}</p>
          </div>
          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
            {nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-sm transition lg:w-full",
                  pathname === link.href ? "bg-ink text-bg" : "text-ink-soft hover:bg-bg-muted",
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm text-ink-soft hover:bg-bg-muted lg:w-full"
              onClick={async () => {
                clearSession();
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
