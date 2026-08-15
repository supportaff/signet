"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CertForm } from "@/components/generator/cert-form";
import { CertResult } from "@/components/generator/cert-result";
import { LimitReached, QuotaBar } from "@/components/generator/quota-bar";
import { buttonVariants } from "@/components/ui/button";
import { useQuota } from "@/hooks/use-quota";
import { generateCertificateBundle } from "@/lib/cert/generate";
import type { CertFormValues, CertType, GeneratedCertificate } from "@/lib/cert/types";
import { getSessionCa, setSessionCa } from "@/lib/cert/session-ca";
import { recordGeneration } from "@/lib/history";
import { incrementUsage } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function GeneratorApp() {
  const { quota, user, ready } = useQuota();
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("Preparing the forge…");
  const [bundle, setBundle] = useState<GeneratedCertificate | null>(null);
  const [sessionCa, setSessionCaState] = useState(getSessionCa);
  const [preferredType, setPreferredType] = useState<CertType | undefined>();

  const onGenerate = async (values: CertFormValues) => {
    const signedIn = Boolean(user && user.id !== "guest");
    if (!signedIn) {
      window.location.href = "/login?next=/generate";
      return;
    }
    try {
      const me = await fetch("/api/me");
      const data = (await me.json()) as { configured?: boolean; quota?: { allowed?: boolean; limit?: number } };
      if (data.configured && data.quota && !data.quota.allowed) {
        toast.error("You've used this plan's certificate limit this month. Upgrade to continue.");
        window.dispatchEvent(new Event("signet-auth"));
        return;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Limit reached.");
      return;
    }
    setBusy(true);
    setPhase(
      values.keyAlgorithm === "rsa-4096"
        ? "Minting a 4096-bit key — this tab will stay busy for a bit…"
        : "Minting a 2048-bit key in this browser…",
    );
    await new Promise((resolve) => window.setTimeout(resolve, 60));
    try {
      const next = await generateCertificateBundle(values);
      setPhase("Signing the certificate…");
      if (signedIn) {
        const recorded = await fetch("/api/certs/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            certType: next.type,
            commonName: next.commonName,
            fingerprintSha256: next.fingerprintSha256,
          }),
        });
        if (recorded.status === 402) {
          toast.error("You've used this plan's certificate limit this month. Upgrade to continue.");
          window.dispatchEvent(new Event("signet-auth"));
          return;
        }
      }
      incrementUsage(user);
      recordGeneration(next);
      if (next.type === "root-ca" && next.certificatePem && next.privateKeyPem) {
        const ca = {
          name: next.commonName,
          certificatePem: next.certificatePem,
          privateKeyPem: next.privateKeyPem,
        };
        setSessionCa(ca);
        setSessionCaState(ca);
      }
      setBundle(next);
      toast.success("Certificate forged locally. Nothing was uploaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return <div className="h-64 rounded-[28px] border border-line skeleton" />;
  }

  if (!user || user.id === "guest") {
    return (
      <div className="rounded-[28px] border border-line bg-surface px-6 py-12 text-center shadow-lift">
        <p className="eyebrow">Sign in required</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">Generate with a Google account.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Free includes 3 certificates per month. Signing in is how we apply the limit.
          Private keys still never leave this browser.
        </p>
        <Link href="/login?next=/generate" className={cn(buttonVariants({ variant: "wax" }), "mt-6")}>
          Continue with Google
        </Link>
      </div>
    );
  }

  if (bundle) {
    return (
      <CertResult
        bundle={bundle}
        onReset={(nextType) => {
          setBundle(null);
          setPreferredType(nextType);
        }}
      />
    );
  }

  if (!quota.allowed) {
    return <LimitReached />;
  }

  return (
    <div className="rounded-[28px] border border-line bg-surface p-5 shadow-lift sm:p-8">
      <QuotaBar />
      {busy ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
          <div className="relative h-16 w-16">
            <span className="absolute inset-0 rounded-full border border-wax/30" />
            <span className="absolute inset-0 animate-[pulse-ring_1.4s_ease-out_infinite] rounded-full border border-wax" />
            <span className="absolute inset-3 rounded-full bg-wax" />
          </div>
          <p className="mt-6 font-serif text-2xl">Forging on this device</p>
          <p className="mt-2 max-w-sm text-sm text-muted">{phase}</p>
        </div>
      ) : (
        <CertForm
          key={preferredType ?? "form"}
          busy={busy}
          sessionCa={sessionCa}
          preferredType={preferredType}
          onGenerate={onGenerate}
        />
      )}
    </div>
  );
}
