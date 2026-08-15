"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inspectCertificatePem, inspectCsrPem, type InspectedField } from "@/lib/cert/inspect";

export function InspectBox({ kind }: { kind: "certificate" | "csr" }) {
  const [pem, setPem] = useState("");
  const [fields, setFields] = useState<InspectedField[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const next =
        kind === "certificate" ? await inspectCertificatePem(pem) : await inspectCsrPem(pem);
      setFields(next);
    } catch {
      setFields(null);
      setError(
        kind === "certificate"
          ? "That does not look like a PEM certificate. Paste a block that starts with BEGIN CERTIFICATE."
          : "That does not look like a PEM CSR. Paste a block that starts with BEGIN CERTIFICATE REQUEST.",
      );
      toast.error("Could not parse the PEM.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={pem}
        onChange={(e) => setPem(e.target.value)}
        rows={10}
        placeholder={
          kind === "certificate" ? "-----BEGIN CERTIFICATE-----" : "-----BEGIN CERTIFICATE REQUEST-----"
        }
        className="w-full rounded-2xl border border-line bg-surface px-3.5 py-3 font-mono text-[12px] outline-none focus:border-wax/70 focus:ring-4 focus:ring-wax/15"
      />
      <Button variant="wax" disabled={busy || !pem.trim()} onClick={run}>
        {busy ? "Reading…" : kind === "certificate" ? "Decode certificate" : "Decode CSR"}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {fields ? (
        <dl className="divide-y divide-line rounded-3xl border border-line bg-surface">
          {fields.map((field) => (
            <div key={field.label} className="grid gap-1 px-5 py-3 sm:grid-cols-[160px_1fr]">
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">{field.label}</dt>
              <dd className="break-all font-mono text-[12px]">{field.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
