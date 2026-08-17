"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { SslCheckResult } from "@/lib/ssl-check-types";

export function ExpiryBox() {
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Array<{ host: string; ok: boolean; detail: string }>>([]);

  const run = async () => {
    const hosts = raw
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);
    if (!hosts.length) return toast.error("Add at least one public hostname.");
    setBusy(true);
    const next = [];
    for (const host of hosts) {
      try {
        const response = await fetch("/api/tools/check-ssl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: host }),
        });
        const payload = (await response.json()) as SslCheckResult & { error?: string };
        if (!response.ok || !payload.certificate) {
          next.push({ host, ok: false, detail: payload.error || "Failed" });
        } else {
          next.push({
            host,
            ok: payload.certificate.daysRemaining > 14,
            detail: `${payload.statusLabel} · ${payload.certificate.daysRemaining} days · ${payload.certificate.issuerCommonName || payload.certificate.issuer}`,
          });
        }
      } catch {
        next.push({ host, ok: false, detail: "Network error" });
      }
    }
    setRows(next);
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        rows={6}
        placeholder={"example.com\nwww.selfsignedcert.com"}
        className="w-full rounded-2xl border border-line bg-surface px-3.5 py-3 font-mono text-[12px] outline-none focus:border-wax/70"
      />
      <Button variant="wax" disabled={busy} onClick={() => void run()}>
        {busy ? "Checking…" : "Check up to 8 hosts"}
      </Button>
      {rows.length ? (
        <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
          {rows.map((row) => (
            <li key={row.host} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:justify-between">
              <span className="font-mono text-sm">{row.host}</span>
              <span className={`text-sm ${row.ok ? "text-sage" : "text-gold"}`}>{row.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
