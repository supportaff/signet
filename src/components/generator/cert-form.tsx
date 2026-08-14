"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hint } from "@/components/ui/tooltip";
import { SanInput } from "@/components/generator/san-input";
import { certFormSchema } from "@/lib/cert/schema";
import {
  COUNTRIES,
  DEFAULT_FORM,
  KEY_ALGORITHMS,
  OTHER_TYPES,
  PKI_TYPES,
  VALIDITY_PRESETS,
  certTypeHint,
  certTypeLabel,
  keyAlgorithmLabel,
  validityLabel,
  type CertFormValues,
  type CertType,
  type SessionCa,
} from "@/lib/cert/types";
import { cn } from "@/lib/utils";

export function CertForm({
  busy,
  sessionCa,
  preferredType,
  onGenerate,
}: {
  busy: boolean;
  sessionCa: SessionCa | null;
  preferredType?: CertType;
  onGenerate: (values: CertFormValues) => Promise<void> | void;
}) {
  const [values, setValues] = useState<CertFormValues>(() => ({
    ...DEFAULT_FORM,
    type: preferredType ?? DEFAULT_FORM.type,
    ...(preferredType === "root-ca"
      ? { commonName: "Local Development CA", sans: [], validityDays: 3650 }
      : preferredType === "host"
        ? { validityDays: 365 }
        : {}),
    caCertificatePem: sessionCa?.certificatePem ?? "",
    caPrivateKeyPem: sessionCa?.privateKeyPem ?? "",
  }));
  const [advanced, setAdvanced] = useState(false);
  const [customDays, setCustomDays] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [usePastedCa, setUsePastedCa] = useState(!sessionCa);

  useEffect(() => {
    if (sessionCa && !usePastedCa) {
      setValues((current) => ({
        ...current,
        caCertificatePem: sessionCa.certificatePem,
        caPrivateKeyPem: sessionCa.privateKeyPem,
      }));
    }
  }, [sessionCa, usePastedCa]);

  const patch = <K extends keyof CertFormValues>(key: K, value: CertFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const selectType = (type: CertType) => {
    setValues((current) => {
      const next = { ...current, type };
      if (type === "root-ca") {
        if (current.commonName === "localhost" || current.commonName === DEFAULT_FORM.commonName) {
          next.commonName = "Local Development CA";
        }
        next.sans = [];
        next.validityDays = 3650;
        setCustomDays("");
      }
      if (type === "host") {
        if (current.commonName === "Local Development CA") {
          next.commonName = "localhost";
          next.sans = DEFAULT_FORM.sans;
        }
        if (current.type === "root-ca") next.validityDays = 365;
      }
      return next;
    });
  };

  const estimate = useMemo(() => {
    if (values.keyAlgorithm === "rsa-4096") return "About 8–20 seconds on this device.";
    return "Usually under two seconds.";
  }, [values.keyAlgorithm]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = certFormSchema.safeParse({
      ...values,
      validityDays: Math.min(Math.max(values.validityDays, 1), 3650),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }
    setError(null);
    await onGenerate(parsed.data);
  };

  const showSans = values.type !== "root-ca";

  return (
    <form onSubmit={submit} className="space-y-8">
      <fieldset>
        <legend className="eyebrow">Private PKI</legend>
        <p className="mt-1 text-sm text-muted">
          Trust a Root CA once, then issue host certificates from it.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {PKI_TYPES.map((type) => (
            <TypeCard
              key={type}
              type={type}
              active={values.type === type}
              onSelect={() => selectType(type)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow">Or a one-off</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {OTHER_TYPES.map((type) => (
            <TypeCard
              key={type}
              type={type}
              active={values.type === type}
              onSelect={() => selectType(type)}
            />
          ))}
        </div>
      </fieldset>

      {values.type === "host" ? (
        <CaSigner
          sessionCa={sessionCa}
          usePastedCa={usePastedCa}
          onTogglePaste={() => setUsePastedCa((v) => !v)}
          caCertificatePem={values.caCertificatePem}
          caPrivateKeyPem={values.caPrivateKeyPem}
          onChange={(key, value) => {
            setUsePastedCa(true);
            patch(key, value);
          }}
        />
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label={values.type === "root-ca" ? "CA name" : "Common name"}
          hint={
            values.type === "root-ca"
              ? "A human name for this authority, like Acme Dev Root CA. This is not a hostname."
              : "The primary identity. For a host this is usually the hostname, like api.dev.local."
          }
        >
          <Input
            value={values.commonName}
            onChange={(e) => patch("commonName", e.target.value)}
            placeholder={values.type === "root-ca" ? "Local Development CA" : "localhost"}
            autoComplete="off"
            required
          />
        </Field>
        <Field
          label="Organization"
          hint="Optional. Appears in the subject as O=."
        >
          <Input
            value={values.organization}
            onChange={(e) => patch("organization", e.target.value)}
            placeholder="Acme Labs"
          />
        </Field>
      </div>

      {showSans ? (
        <Field
          label="Subject alternative names"
          hint="Hostnames, IPs, or emails this certificate may present. Press Enter to add. Browsers check SANs, not only the common name."
        >
          <SanInput value={values.sans} onChange={(sans) => patch("sans", sans)} />
        </Field>
      ) : (
        <p className="rounded-2xl border border-line bg-bg-muted/60 px-4 py-3 text-sm text-muted">
          A Root CA identifies an authority, not a host. SANs are omitted on purpose.
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Validity"
          hint={
            values.type === "root-ca"
              ? "CAs should outlive the host certs they sign. Five to ten years is typical for a lab CA."
              : "How long this certificate should be considered valid. Keep host certs shorter than the CA."
          }
        >
          <div className="flex flex-wrap gap-2">
            {VALIDITY_PRESETS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => {
                  patch("validityDays", days);
                  setCustomDays("");
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  values.validityDays === days && !customDays
                    ? "border-ink bg-ink text-bg"
                    : "border-line hover:border-line-strong",
                )}
              >
                {validityLabel(days)}
              </button>
            ))}
            <Input
              inputMode="numeric"
              value={customDays}
              onChange={(e) => {
                setCustomDays(e.target.value);
                const n = Number(e.target.value);
                if (Number.isFinite(n) && n > 0) patch("validityDays", Math.round(n));
              }}
              placeholder="Custom days"
              className="h-8 w-28 px-2 text-xs"
            />
          </div>
        </Field>
        <Field
          label="Key size"
          hint="2048-bit RSA is the right default. 4096-bit is slower and rarely required for internal certs."
        >
          <div className="grid grid-cols-2 gap-2">
            {KEY_ALGORITHMS.map((algo) => (
              <button
                key={algo}
                type="button"
                onClick={() => patch("keyAlgorithm", algo)}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-left transition",
                  values.keyAlgorithm === algo
                    ? "border-ink bg-ink text-bg"
                    : "border-line hover:border-line-strong",
                )}
              >
                <p className="text-sm font-medium">{keyAlgorithmLabel(algo)}</p>
                <p className={cn("mt-1 text-xs", values.keyAlgorithm === algo ? "text-bg/70" : "text-muted")}>
                  {algo === "rsa-4096" ? "Slower, extra margin" : "Recommended"}
                </p>
              </button>
            ))}
          </div>
        </Field>
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm text-ink-soft"
        onClick={() => setAdvanced((v) => !v)}
      >
        <ChevronDown className={cn("h-4 w-4 transition", advanced && "rotate-180")} />
        Advanced subject fields
      </button>

      {advanced ? (
        <div className="grid gap-5 rounded-3xl border border-line bg-surface p-5 md:grid-cols-2">
          <Field label="Organizational unit">
            <Input
              value={values.organizationalUnit}
              onChange={(e) => patch("organizationalUnit", e.target.value)}
              placeholder="Platform"
            />
          </Field>
          <Field label="Country">
            <select
              value={values.country}
              onChange={(e) => patch("country", e.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm outline-none focus:border-wax/70 focus:ring-4 focus:ring-wax/15"
            >
              <option value="">Select</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code} — {country.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="State / province">
            <Input
              value={values.state}
              onChange={(e) => patch("state", e.target.value)}
              placeholder="California"
            />
          </Field>
          <Field label="Locality">
            <Input
              value={values.locality}
              onChange={(e) => patch("locality", e.target.value)}
              placeholder="San Francisco"
            />
          </Field>
          <Field label="Email" className="md:col-span-2">
            <Input
              type="email"
              value={values.email}
              onChange={(e) => patch("email", e.target.value)}
              placeholder="ops@acme.test"
            />
          </Field>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Keys are created on this device. {estimate} Nothing is uploaded.
        </p>
        <Button type="submit" variant="wax" size="lg" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Forging…" : "Generate in this browser"}
        </Button>
      </div>
    </form>
  );
}

function CaSigner({
  sessionCa,
  usePastedCa,
  onTogglePaste,
  caCertificatePem,
  caPrivateKeyPem,
  onChange,
}: {
  sessionCa: SessionCa | null;
  usePastedCa: boolean;
  onTogglePaste: () => void;
  caCertificatePem: string;
  caPrivateKeyPem: string;
  onChange: (key: "caCertificatePem" | "caPrivateKeyPem", value: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-line bg-bg-muted/60 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium">Signing Root CA</p>
          <p className="mt-1 text-sm text-muted">
            The host certificate is signed by this CA in your browser. The CA key is not stored.
          </p>
        </div>
        {sessionCa ? (
          <button type="button" className="text-sm text-wax hover:underline" onClick={onTogglePaste}>
            {usePastedCa ? "Use the CA from this tab" : "Paste a different CA"}
          </button>
        ) : null}
      </div>

      {sessionCa && !usePastedCa ? (
        <div className="rounded-2xl border border-sage/25 bg-sage/10 px-4 py-3 text-sm">
          Using <span className="font-medium">{sessionCa.name}</span> forged in this tab.
          Trust the CA on your machine, then install the host cert on the server.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="CA certificate PEM"
            hint="The Root CA .crt you already downloaded. Used only to sign this host."
          >
            <textarea
              value={caCertificatePem}
              onChange={(e) => onChange("caCertificatePem", e.target.value)}
              rows={6}
              placeholder="-----BEGIN CERTIFICATE-----"
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 font-mono text-[11px] outline-none focus:border-wax/70 focus:ring-4 focus:ring-wax/15"
            />
          </Field>
          <Field
            label="CA private key PEM"
            hint="Stays in this tab. Never uploaded. Required to sign the host certificate."
          >
            <textarea
              value={caPrivateKeyPem}
              onChange={(e) => onChange("caPrivateKeyPem", e.target.value)}
              rows={6}
              placeholder="-----BEGIN RSA PRIVATE KEY-----"
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 font-mono text-[11px] outline-none focus:border-wax/70 focus:ring-4 focus:ring-wax/15"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-1.5">
        <Label>{label}</Label>
        {hint ? <Hint>{hint}</Hint> : null}
      </div>
      {children}
    </div>
  );
}

function TypeCard({
  type,
  active,
  onSelect,
}: {
  type: CertType;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-3xl border p-4 text-left transition",
        active ? "border-wax bg-wax-soft/70 shadow-lift" : "border-line bg-surface hover:border-line-strong",
      )}
    >
      <p className="font-medium">{certTypeLabel(type)}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{certTypeHint(type)}</p>
    </button>
  );
}
