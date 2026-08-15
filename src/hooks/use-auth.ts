"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { getSession, type AuthUser } from "@/lib/auth";

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const [localUser, setLocalUser] = useState<AuthUser | null>(null);
  const [localReady, setLocalReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setLocalUser(getSession());
      setLocalReady(true);
    };
    sync();
    window.addEventListener("signet-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("signet-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const user = useMemo<AuthUser | null>(() => {
    if (clerkUser) {
      const stored = localUser?.id === clerkUser.id ? localUser : null;
      return {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || clerkUser.username || stored?.name || "Signed in",
        email: clerkUser.primaryEmailAddress?.emailAddress || stored?.email || "",
        plan: stored?.plan ?? "free",
        createdAt: clerkUser.createdAt?.toISOString() ?? stored?.createdAt ?? new Date().toISOString(),
      };
    }
    return localUser;
  }, [clerkUser, localUser]);

  const ready = isLoaded && localReady;
  const isAuthenticated = Boolean(clerkUser || (user && user.id !== "guest"));

  return { user, ready, isAuthenticated };
}
