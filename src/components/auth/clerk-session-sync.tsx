"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { getSession, setSession, type AuthUser } from "@/lib/auth";
import type { PlanId } from "@/lib/plans";

export function ClerkSessionSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const existing = getSession();
    const base: AuthUser = {
      id: user.id,
      name: user.fullName || user.firstName || user.username || "Signed in",
      email: user.primaryEmailAddress?.emailAddress || "",
      plan: existing?.id === user.id ? existing.plan : "free",
      createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
    };

    if (
      !existing ||
      existing.id !== base.id ||
      existing.name !== base.name ||
      existing.email !== base.email
    ) {
      setSession(base);
    }

    void fetch("/api/me/sync", { method: "POST" })
      .then((response) => response.json())
      .then((data: { quota?: { plan?: PlanId } }) => {
        if (!data.quota?.plan) return;
        const current = getSession();
        if (!current || current.id !== user.id) return;
        if (current.plan !== data.quota.plan) {
          setSession({ ...current, plan: data.quota.plan });
        }
      })
      .catch(() => undefined);
  }, [isLoaded, user]);

  return null;
}
