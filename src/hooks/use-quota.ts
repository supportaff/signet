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
  const { user, ready: authReady } = useAuth();
  const [quota, setQuota] = useState<Quota>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setQuota(getQuota(user));
      setReady(true);
    };
    sync();
    window.addEventListener("signet-quota", sync);
    window.addEventListener("signet-auth", sync);
    return () => {
      window.removeEventListener("signet-quota", sync);
      window.removeEventListener("signet-auth", sync);
    };
  }, [user]);

  return { quota, ready: ready && authReady, user };
}
