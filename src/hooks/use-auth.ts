"use client";

import { useEffect, useState } from "react";
import { getSession, type AuthUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setUser(getSession());
      setReady(true);
    };
    sync();
    window.addEventListener("signet-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("signet-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready, isAuthenticated: Boolean(user && user.id !== "guest") };
}
