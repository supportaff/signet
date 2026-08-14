"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  continueAsDemo,
  continueAsGuest,
  loginWithMagicLink,
  loginWithPassword,
  signupWithPassword,
} from "@/lib/auth";
import { seedDemoHistory } from "@/lib/history";
import { site } from "@/lib/site";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "login" ? site.demoEmail : "");
  const [password, setPassword] = useState(mode === "login" ? site.demoPassword : "");
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const finish = (label: string) => {
    toast.success(label);
    router.push(next);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        signupWithPassword(name, email, password);
        finish("Account created on this device.");
      } else {
        loginWithPassword(email, password);
        if (email.trim().toLowerCase() === site.demoEmail) seedDemoHistory();
        finish("Signed in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[28px] border border-line bg-surface p-7 shadow-lift">
      <p className="eyebrow">{mode === "login" ? "Welcome back" : "Create account"}</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight">
        {mode === "login" ? "Sign in to Signet" : "Join Signet"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Dummy authentication for this demo. Accounts live in this browser only.
        We still never store certificates or keys.
      </p>

      <div className="mt-5 rounded-2xl border border-gold/20 bg-gold/8 px-4 py-3 text-sm">
        <p className="font-medium text-gold">Demo login</p>
        <p className="mt-1 text-ink-soft">
          {site.demoEmail} / {site.demoPassword}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => {
            continueAsDemo();
            seedDemoHistory();
            finish("Signed in as Alex Rivera.");
          }}
        >
          Continue as demo user
        </Button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "signup" ? (
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              required
            />
          </div>
        ) : null}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            className="mt-1.5"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            className="mt-1.5"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" variant="wax" className="w-full" disabled={busy}>
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      {magicSent ? (
        <div className="mt-4 rounded-2xl border border-line bg-bg-muted p-4 text-sm">
          <p>Pretend inbox: a magic link arrived for {email || "you"}.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              try {
                loginWithMagicLink(email);
                finish("Signed in via magic link.");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Magic link failed.");
              }
            }}
          >
            Open magic link (demo)
          </Button>
        </div>
      ) : (
        <button
          type="button"
          className="mt-4 text-sm text-ink-soft underline-offset-4 hover:underline"
          onClick={() => {
            if (!email.trim()) {
              setError("Enter an email first to simulate a magic link.");
              return;
            }
            setError(null);
            setMagicSent(true);
          }}
        >
          Email me a magic link instead
        </button>
      )}

      <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5 text-sm text-ink-soft">
        <button
          type="button"
          className="text-left hover:text-ink"
          onClick={() => {
            continueAsGuest();
            finish("Continuing as guest.");
          }}
        >
          Continue without an account
        </button>
        {mode === "login" ? (
          <p>
            New here?{" "}
            <Link href="/signup" className="text-ink underline-offset-4 hover:underline">
              Create a demo account
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
