"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { validateCertificateChain, type ChainCheck } from "@/lib/cert/chain";

export function ChainBox() {
  const [pem, setPem] = useState("");
  const [result, setResult] = useState<ChainCheck | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      setResult(await validateCertificateChain(pem));
    } catch (error) {
      setResult(null);
      toast.error(error instanceof Error ? error.message : "Could not read that chain.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={pem}
        onChange={(event) => setPem(event.target.value)}
        rows={12}
        placeholder="Leaf first, then intermediates, then root. PEM only."
        className="w-full rounded-2xl border border-line bg-surface px-3.5 py-3 font-mono text-[12px] outline-none focus:border-wax/70 focus:ring-4 focus:ring-wax/15"
      />
      <Button variant="wax" disabled={busy || !pem.trim()} onClick={() => void run()}>
        {busy ? "Checking…" : "Validate chain"}
      </Button>
      {result ? (
        <div className="space-y-3 rounded-[28px] border border-line bg-surface p-5">
          <p className={result.ok ? "text-sage" : "text-gold"}>{result.summary}</p>
          {result.issues.map((issue) => (
            <p key={issue} className="text-sm text-muted">
              {issue}
            </p>
          ))}
          <ul className="space-y-2 text-sm">
            {result.certs.map((cert, index) => (
              <li key={`${cert.subject}-${index}`} className="rounded-2xl border border-line px-4 py-3">
                <p className="font-medium">
                  {index === 0 ? "Leaf" : index === result.certs.length - 1 ? "Last" : "Intermediate"} · {cert.subject}
                </p>
                <p className="mt-1 text-xs text-muted">Issuer {cert.issuer}</p>
                <p className="mt-1 text-xs text-muted">Not after {cert.notAfter}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
