"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CertForm } from "@/components/generator/cert-form";
import { CertResult } from "@/components/generator/cert-result";
import { LimitReached, QuotaBar } from "@/components/generator/quota-bar";
import { useQuota } from "@/hooks/use-quota";
import { generateCertificateBundle } from "@/lib/cert/generate";
import type { CertFormValues, CertType, GeneratedCertificate } from "@/lib/cert/types";
import { getSessionCa, setSessionCa } from "@/lib/cert/session-ca";
import { recordGeneration } from "@/lib/history";
import { assertCanGenerate, incrementUsage } from "@/lib/plans";

export function GeneratorApp() {
  const { quota, user } = useQuota();
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("Preparing the forge…");
  const [bundle, setBundle] = useState<GeneratedCertificate | null>(null);
  const [sessionCa, setSessionCaState] = useState(getSessionCa);
  const [preferredType, setPreferredType] = useState<CertType | undefined>();

  const onGenerate = async (values: CertFormValues) => {
    try {
      assertCanGenerate(user);
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
