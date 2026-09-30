"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CaaPayload = {
  domain: string;
  matched: string | null;
  records: { name: string; critical: boolean; tag: string; value: string }[];
  error?: string;
};

export function CaaTool() {
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CaaPayload | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/tools/caa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const payload = (await response.json()) as CaaPayload;
      if (!response.ok) throw new Error(payload.error || "Lookup failed.");
      setResult(payload);
    } catch (error) {
      setResult(null);
      toast.error(error instanceof Error ? error.message : "Lookup failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-3 sm:flex-row">
        <Input value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="example.com" required />
        <Button type="submit" variant="wax" disabled={busy}>
          {busy ? "Looking up…" : "Check CAA"}
        </Button>
      </form>
      {result ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            {result.matched
              ? `CAA is set on ${result.matched}. Only the CAs listed here should issue.`
              : `No CAA record on ${result.domain}. Any public CA may issue for that name.`}
          </p>
          {result.records.length ? (
            <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
              {result.records.map((record) => (
                <li key={`${record.name}-${record.tag}-${record.value}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span>
                    <span className="font-mono">{record.tag}</span>
                    <span className="ml-2 text-muted">{record.value}</span>
                  </span>
                  <span className="text-xs text-muted">{record.critical ? "critical" : record.name}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
