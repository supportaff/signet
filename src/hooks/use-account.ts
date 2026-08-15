"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Quota } from "@/lib/plans";
import type { SignetAccount, TrackingStatus } from "@/lib/users";

export function useAccount() {
  const { user, ready: authReady, isAuthenticated } = useAuth();
  const [account, setAccount] = useState<SignetAccount | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [tracking, setTracking] = useState<TrackingStatus>("not_configured");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminConfigured, setAdminConfigured] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isAuthenticated || user?.id === "guest") {
        setAccount(null);
        setIsAdmin(false);
        setReady(true);
        return;
      }
      try {
        const response = await fetch("/api/me");
        const data = (await response.json()) as {
          configured?: boolean;
          tracking?: TrackingStatus;
          account?: SignetAccount;
          quota?: Quota;
          isAdmin?: boolean;
          adminConfigured?: boolean;
        };
        if (cancelled) return;
        setTracking(data.tracking ?? (data.configured ? "ok" : "not_configured"));
        setAccount(data.account ?? null);
        setQuota(data.quota ?? null);
        setIsAdmin(Boolean(data.isAdmin));
        setAdminConfigured(Boolean(data.adminConfigured));
      } catch {
        if (!cancelled) setTracking("error");
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void load();
    window.addEventListener("signet-auth", load);
    return () => {
      cancelled = true;
      window.removeEventListener("signet-auth", load);
    };
  }, [user, isAuthenticated]);

  return {
    user,
    account,
    quota,
    tracking,
    isAdmin,
    adminConfigured,
    ready: ready && authReady,
    isAuthenticated,
  };
}
