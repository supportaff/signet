"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SubdomainTool() {
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    domain: string;
    count: number;
    hosts: { host: string; ip: string | null; source: string }[];
  } | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/tools/subdomains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const payload = (await response.json()) as { error?: string } & NonNullable<typeof result>;
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
          {busy ? "Searching…" : "Find subdomains"}
        </Button>
      </form>
      {result ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            {result.count} name{result.count === 1 ? "" : "s"} for {result.domain}
          </p>
          <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
            {result.hosts.map((row) => (
              <li key={row.host} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:justify-between">
                <span className="font-mono text-sm">{row.host}</span>
                <span className="text-xs text-muted">
                  {row.source === "dns" ? "DNS" : "CT"} {row.ip ? `· ${row.ip}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function PortProbeTool() {
  const [host, setHost] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    hostname: string;
    ip: string;
    nmap: string;
    ports: { port: number; label: string; open: boolean }[];
  } | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/tools/port-probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: host }),
      });
      const payload = (await response.json()) as { error?: string } & NonNullable<typeof result>;
      if (!response.ok) throw new Error(payload.error || "Probe failed.");
      setResult(payload);
    } catch (error) {
      setResult(null);
      toast.error(error instanceof Error ? error.message : "Probe failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-3 sm:flex-row">
        <Input value={host} onChange={(event) => setHost(event.target.value)} placeholder="example.com" required />
        <Button type="submit" variant="wax" disabled={busy}>
          {busy ? "Probing…" : "Check web ports"}
        </Button>
      </form>
      {result ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {result.hostname} · {result.ip}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {result.ports.map((port) => (
              <li key={port.port} className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
                <span className={port.open ? "text-sage" : "text-muted"}>{port.open ? "Open" : "Closed / filtered"}</span>
                <span className="ml-2 font-mono">
                  {port.port} · {port.label}
                </span>
              </li>
            ))}
          </ul>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Run full nmap locally</p>
            <pre className="mt-2 overflow-x-auto rounded-2xl border border-line bg-surface p-4 text-[12px]">{result.nmap}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
