"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getQuota, type Quota } from "@/lib/plans";

const empty: Quota = {
  plan: "free",
  limit: 3,
  used: 0,
  remaining: 3,
  allowed: true,
};

export function useQuota() {
  const { user, ready: authReady, isAuthenticated } = useAuth();
  const [quota, setQuota] = useState<Quota>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applyLocal = () => {
      setQuota(getQuota(user));
      setReady(true);
    };

    const load = async () => {
      if (!isAuthenticated || user?.id === "guest") {
        applyLocal();
        return;
      }
      try {
        const response = await fetch("/api/me");
        const data = (await response.json()) as { configured?: boolean; quota?: Quota };
        if (cancelled) return;
        if (data.configured && data.quota) {
          setQuota(data.quota);
        } else {
          applyLocal();
          return;
        }
      } catch {
        if (!cancelled) applyLocal();
        return;
      }
      setReady(true);
    };

    const onAuth = () => {
      void load();
    };
    void load();
    window.addEventListener("signet-quota", applyLocal);
    window.addEventListener("signet-auth", onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("signet-quota", applyLocal);
      window.removeEventListener("signet-auth", onAuth);
    };
  }, [user, isAuthenticated]);

  return { quota, ready: ready && authReady, user };
}
