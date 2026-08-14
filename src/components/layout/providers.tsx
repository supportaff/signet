"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          className:
            "!bg-surface !text-ink !border !border-line !shadow-lift !rounded-2xl",
        }}
      />
    </ThemeProvider>
  );
}
