"use client";

import { useEffect, useState } from "react";
import { getSession, type AuthUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const applyLocal = () => setUser(getSession());

    const sync = async () => {
      applyLocal();
      try {
        const response = await fetch("/api/auth/session");
        const data = (await response.json()) as {
          user?: { id: string; email: string; name: string } | null;
        };
        if (data.user) {
          const stored = getSession();
          const next: AuthUser = {
            id: data.user.id,
            name: data.user.name || stored?.name || "Signed in",
            email: data.user.email || stored?.email || "",
            plan: stored?.id === data.user.id ? stored.plan : "free",
            createdAt: stored?.id === data.user.id ? stored.createdAt : new Date().toISOString(),
          };
          setUser(next);
        } else {
          applyLocal();
        }
      } catch {
        applyLocal();
      } finally {
        setReady(true);
      }
    };

    void sync();
    window.addEventListener("signet-auth", applyLocal);
    window.addEventListener("storage", applyLocal);
    return () => {
      window.removeEventListener("signet-auth", applyLocal);
      window.removeEventListener("storage", applyLocal);
    };
  }, []);

  const isAuthenticated = Boolean(user && user.id !== "guest");
  return { user, ready, isAuthenticated };
}
