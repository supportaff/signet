"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { matchKeyToMaterial, type KeyMatchResult } from "@/lib/cert/match-key";

const fieldClass =
  "w-full rounded-2xl border border-line bg-surface px-3.5 py-3 font-mono text-[12px] outline-none focus:border-wax/70 focus:ring-4 focus:ring-wax/15";

export function MatchKeyBox() {
  const [material, setMaterial] = useState("");
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<KeyMatchResult | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      const next = await matchKeyToMaterial(material, key);
      setResult(next);
      toast.success(next.match ? "The key matches." : "Those do not match.");
    } catch (error) {
      setResult(null);
      toast.error(error instanceof Error ? error.message : "Could not compare those PEMs.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="text-muted">Certificate or CSR</span>
        <textarea
          value={material}
          onChange={(event) => setMaterial(event.target.value)}
          rows={8}
          placeholder="-----BEGIN CERTIFICATE-----"
          className={`mt-1.5 ${fieldClass}`}
        />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Private key or public key</span>
        <textarea
          value={key}
          onChange={(event) => setKey(event.target.value)}
          rows={8}
          placeholder="-----BEGIN PRIVATE KEY-----"
          className={`mt-1.5 ${fieldClass}`}
        />
      </label>
      <Button variant="wax" disabled={busy || !material.trim() || !key.trim()} onClick={() => void run()}>
        {busy ? "Comparing…" : "Compare in this tab"}
      </Button>
      {result ? (
        <div className={`rounded-3xl border p-5 ${result.match ? "border-sage/40 bg-sage/10" : "border-danger/30 bg-danger/10"}`}>
          <p className="font-serif text-2xl">{result.match ? "Match" : "No match"}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {result.material === "certificate" ? "Certificate" : "CSR"} compared with{" "}
            {result.keyKind === "private" ? "the RSA private key" : "the public key"}. Nothing was uploaded.
          </p>
          <p className="mt-3 font-mono text-[12px] text-muted">SPKI SHA-256 {result.fingerprint}</p>
        </div>
      ) : null}
    </div>
  );
}
