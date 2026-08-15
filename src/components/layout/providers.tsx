"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ReactNode } from "react";
import { ClerkSessionSync } from "@/components/auth/clerk-session-sync";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        variables: {
          colorPrimary: "#c24a2a",
          colorBackground: "#161410",
          borderRadius: "0.9rem",
        },
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ClerkSessionSync />
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            className:
              "!bg-surface !text-ink !border !border-line !shadow-lift !rounded-2xl",
          }}
        />
      </ThemeProvider>
    </ClerkProvider>
  );
}
