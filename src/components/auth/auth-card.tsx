"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { continueAsGuest } from "@/lib/auth";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  return (
    <div className="w-full max-w-md rounded-[28px] border border-line bg-surface p-7 shadow-lift">
      <p className="eyebrow">{mode === "login" ? "Welcome back" : "Create account"}</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight">
        {mode === "login" ? "Sign in to Signet" : "Join Signet"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Sign in with Google via Clerk. Certificates and private keys still never leave this browser.
      </p>

      {mode === "signup" ? (
        <SignUpButton mode="modal" forceRedirectUrl={next} oauthFlow="auto">
          <Button variant="wax" className="mt-6 w-full">
            <GoogleMark />
            Continue with Google
          </Button>
        </SignUpButton>
      ) : (
        <SignInButton mode="modal" forceRedirectUrl={next} oauthFlow="auto">
          <Button variant="wax" className="mt-6 w-full">
            <GoogleMark />
            Continue with Google
          </Button>
        </SignInButton>
      )}

      <p className="mt-3 text-xs text-muted">
        If Google is not listed, enable it in Clerk: Configure → SSO connections → Google.
      </p>

      <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5 text-sm text-ink-soft">
        <button
          type="button"
          className="text-left hover:text-ink"
          onClick={() => {
            continueAsGuest();
            toast.success("Continuing as guest.");
            router.push(next);
          }}
        >
          Continue without an account
        </button>
        {mode === "login" ? (
          <p>
            New here?{" "}
            <Link href="/signup" className="text-ink underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        ) : (
          <p>
            Already have one?{" "}
            <Link href="/login" className="text-ink underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.11A6.97 6.97 0 0 1 5.48 12c0-.73.13-1.45.36-2.11V7.05H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
      />
    </svg>
  );
}
