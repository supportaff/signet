"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { LayoutDashboard, LogOut, Plus, Settings } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
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
  const { signOut } = useClerk();
  const pathname = usePathname();
  const router = useRouter();

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
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-3xl border border-line bg-surface p-3 lg:sticky lg:top-24">
        <div className="px-3 py-3">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted">{isGuest(user) ? "Guest session" : user.email}</p>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm transition",
                pathname === link.href ? "bg-ink text-bg" : "text-ink-soft hover:bg-bg-muted",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm text-ink-soft hover:bg-bg-muted"
            onClick={async () => {
              clearSession();
              await signOut({ redirectUrl: "/" });
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
