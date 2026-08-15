"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const compact = pathname.startsWith("/generate") || pathname.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {user?.name.split(" ")[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Sign in
            </Link>
          )}
          <Link
            href="/generate"
            className={cn(buttonVariants({ variant: compact ? "outline" : "wax", size: "sm" }))}
          >
            Generate
          </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-line bg-bg px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                {user?.name.split(" ")[0] ?? "Dashboard"}
              </Link>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            )}
            <Link
              href="/generate"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ variant: "wax" }), "mt-1")}
            >
              Generate a certificate
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
