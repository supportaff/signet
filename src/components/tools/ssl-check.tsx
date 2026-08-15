"use client";

import { FormEvent, useState } from "react";
import { Globe, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SslCheckResult, SslCheckStatus } from "@/lib/ssl-check-types";

const STATUS_TONE: Record<SslCheckStatus, "sage" | "gold" | "danger"> = {
  valid: "sage",
  expiring: "gold",
  expired: "danger",
  not_yet_valid: "gold",
  untrusted: "gold",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function remainingLabel(days: number) {
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "Expires today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

export function SslCheck({ compact = false, initialUrl = "" }: { compact?: boolean; initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SslCheckResult | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next = url.trim();
    if (!next) {
      setError("Enter a hostname or URL, like example.com.");
      setResult(null);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/tools/check-ssl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: next }),
      });
      const payload = (await response.json()) as SslCheckResult | { error?: string };
      if (!response.ok || !("ok" in payload)) {
        setResult(null);
        setError("error" in payload && payload.error ? payload.error : "Could not check that certificate.");
        return;
      }
      setResult(payload);
    } catch {
      setResult(null);
      setError("Could not reach the checker. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="example.com or https://example.com"
            autoComplete="url"
            inputMode="url"
            spellCheck={false}
            aria-label="Website URL"
            className="pl-10"
          />
        </div>
        <Button variant="wax" type="submit" disabled={busy} className="sm:w-auto">
          {busy ? "Checking…" : "Check certificate"}
        </Button>
      </form>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {result ? <SslCheckResultCard result={result} compact={compact} /> : null}
    </div>
  );
}

function SslCheckResultCard({ result, compact }: { result: SslCheckResult; compact: boolean }) {
  const Icon = result.status === "expired" ? ShieldAlert : ShieldCheck;
  const fields = [
    { label: "Issued to", value: result.certificate.subject },
    { label: "Issued by", value: result.certificate.issuer },
    { label: "Valid from", value: formatDate(result.certificate.notBefore) },
    { label: "Valid until", value: formatDate(result.certificate.notAfter) },
    { label: "SANs", value: result.certificate.sans.join(", ") || "None" },
    { label: "Serial", value: result.certificate.serial },
    { label: "SHA-256", value: result.certificate.fingerprintSha256 },
    {
      label: "Connection",
      value: [result.protocol, result.cipher].filter(Boolean).join(" · ") || "TLS",
    },
  ];

  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
      <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon
            className={cn(
              "mt-0.5 h-5 w-5",
              result.status === "valid" && "text-sage",
              result.status === "expiring" && "text-gold",
              result.status === "expired" && "text-danger",
              (result.status === "not_yet_valid" || result.status === "untrusted") && "text-gold",
            )}
          />
          <div>
            <p className="font-medium">{result.host.hostname}</p>
            <p className="mt-1 text-sm text-muted">
              {remainingLabel(result.certificate.daysRemaining)}
              {result.hostnameMatches ? "" : " · hostname does not match"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={STATUS_TONE[result.status]}>{result.statusLabel}</Badge>
          <Badge tone={result.hostnameMatches ? "sage" : "danger"}>
            {result.hostnameMatches ? "Hostname matches" : "Hostname mismatch"}
          </Badge>
          <Badge tone={result.trustedByPublicCas ? "sage" : "gold"}>
            {result.trustedByPublicCas ? "Publicly trusted" : "Not publicly trusted"}
          </Badge>
        </div>
      </div>

      <dl className="divide-y divide-line">
        {(compact ? fields.slice(0, 5) : fields).map((field) => (
          <div key={field.label} className="grid gap-1 px-5 py-3 sm:grid-cols-[140px_1fr]">
            <dt className="text-xs uppercase tracking-[0.12em] text-muted">{field.label}</dt>
            <dd className="break-all font-mono text-[12px]">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
