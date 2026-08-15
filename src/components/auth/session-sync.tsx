"use client";

import { useEffect } from "react";
import { getSession, setSession, type AuthUser } from "@/lib/auth";
import type { PlanId } from "@/lib/plans";

export function SessionSync() {
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = (await response.json()) as {
          user?: { id: string; email: string; name: string } | null;
        };
        if (cancelled || !data.user) return;

        const existing = getSession();
        const next: AuthUser = {
          id: data.user.id,
          name: data.user.name || existing?.name || "Signed in",
          email: data.user.email || existing?.email || "",
          plan: existing?.id === data.user.id ? existing.plan : "free",
          createdAt: existing?.id === data.user.id ? existing.createdAt : new Date().toISOString(),
        };
        if (
          !existing ||
          existing.id !== next.id ||
          existing.name !== next.name ||
          existing.email !== next.email
        ) {
          setSession(next);
        }

        const synced = await fetch("/api/me/sync", { method: "POST" });
        const body = (await synced.json()) as { quota?: { plan?: PlanId } };
        if (cancelled || !body.quota?.plan) return;
        const current = getSession();
        if (current && current.id === next.id && current.plan !== body.quota.plan) {
          setSession({ ...current, plan: body.quota.plan });
        }
      } catch {
        return;
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
