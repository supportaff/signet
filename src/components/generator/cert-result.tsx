"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileArchive,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  downloadCaCertificate,
  downloadCertificate,
  downloadChain,
  downloadCsr,
  downloadPem,
  downloadPfx,
  downloadPrivateKey,
  downloadPublicKey,
  downloadZip,
} from "@/lib/cert/download";
import {
  certTypeLabel,
  keyAlgorithmLabel,
  type CertType,
  type GeneratedCertificate,
} from "@/lib/cert/types";
import { copyText, formatDate, hexColon } from "@/lib/utils";

export function CertResult({
  bundle,
  onReset,
}: {
  bundle: GeneratedCertificate;
  onReset: (nextType?: CertType) => void;
}) {
  const [pfxPassword, setPfxPassword] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!downloaded) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [downloaded]);

  const copy = async (label: string, value: string) => {
    if (!value) return;
    await copyText(value);
    setCopied(label);
    toast.success(`Copied ${label}`);
    window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 1600);
  };

  const markDownloaded = () => setDownloaded(true);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-lift">
        <div className="flex flex-col gap-4 border-b border-line px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="animate-seal hidden h-16 w-16 sm:block">
              <Wax />
            </div>
            <div>
              <p className="eyebrow text-sage">Forged in this browser</p>
              <h2 className="mt-1 font-serif text-3xl tracking-tight">{bundle.commonName}</h2>
              <p className="mt-1 text-sm text-muted">
                {certTypeLabel(bundle.type)} · {keyAlgorithmLabel(bundle.keyAlgorithm)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {bundle.type === "root-ca" ? (
              <Button variant="wax" onClick={() => onReset("host")}>
                Issue a host certificate
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => onReset()}>
              <RotateCcw className="h-4 w-4" />
              New certificate
            </Button>
          </div>
        </div>

        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-danger/20 bg-danger/8 p-4 sm:col-span-2">
            <p className="flex items-center gap-2 text-sm font-medium text-danger">
              <TriangleAlert className="h-4 w-4" />
              {bundle.type === "root-ca"
                ? "This CA private key can sign any host. Guard it."
                : "This is the only time the private key exists"}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {bundle.type === "root-ca"
                ? "Trust the CA on your machines. Then issue host certificates signed by it. SelfSignedCert does not keep this key."
                : "SelfSignedCert does not store it. If you leave without downloading, it cannot be recovered."}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-medium">Downloads</h3>
            <p className="text-sm text-muted">Assembled here. Never uploaded.</p>
          </div>
          <Button
            variant="wax"
            onClick={async () => {
              await downloadZip(bundle, bundle.type === "csr" ? undefined : pfxPassword);
              markDownloaded();
              toast.success("Zip assembled in the browser");
            }}
          >
            <FileArchive className="h-4 w-4" />
            Download all
          </Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bundle.certificatePem ? (
            <DownloadCard
              title=".crt"
              hint="Certificate"
              onClick={() => {
                downloadCertificate(bundle);
                markDownloaded();
              }}
            />
          ) : null}
          {bundle.privateKeyPem ? (
            <DownloadCard
              title=".key"
              hint="Private key"
              warn
              onClick={() => {
                downloadPrivateKey(bundle);
                markDownloaded();
              }}
            />
          ) : null}
          <DownloadCard
            title=".pem"
            hint={bundle.combinedPem ? "Cert + key" : bundle.csrPem ? "CSR" : "PEM"}
            onClick={() => {
              if (bundle.csrPem && !bundle.combinedPem) downloadCsr(bundle);
              else downloadPem(bundle);
              markDownloaded();
            }}
          />
          {bundle.caCertificatePem ? (
            <DownloadCard
              title="-ca.crt"
              hint="Signing Root CA"
              onClick={() => {
                downloadCaCertificate(bundle);
                markDownloaded();
              }}
            />
          ) : null}
          {bundle.chainPem ? (
            <DownloadCard
              title="-chain.pem"
              hint="Host + CA"
              onClick={() => {
                downloadChain(bundle);
                markDownloaded();
              }}
            />
          ) : null}
          {bundle.csrPem ? (
            <DownloadCard
              title=".csr"
              hint="Signing request"
              onClick={() => {
                downloadCsr(bundle);
                markDownloaded();
              }}
            />
          ) : null}
          <DownloadCard
            title=".pub.pem"
            hint="Public key"
            onClick={() => {
              downloadPublicKey(bundle);
              markDownloaded();
            }}
          />
        </div>

        {bundle.certificatePem && bundle.privateKeyPem ? (
          <div className="mt-6 rounded-2xl border border-line bg-bg-muted/60 p-4">
            <Label>PFX / PKCS#12 password</Label>
            <p className="mt-1 text-xs text-muted">
              Optional but recommended. Windows and some mobile stacks expect a passworded .pfx.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                type="password"
                value={pfxPassword}
                onChange={(e) => setPfxPassword(e.target.value)}
                placeholder="Choose a password you will remember"
              />
              <Button
                variant="outline"
                onClick={async () => {
                  await downloadPfx(bundle, pfxPassword);
                  markDownloaded();
                  toast.success("PFX created in the browser");
                }}
              >
                <Download className="h-4 w-4" />
                Download .pfx
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-line bg-surface p-6">
        <h3 className="font-medium">Certificate details</h3>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <Detail label="Subject" value={bundle.subject} />
          {bundle.issuer ? <Detail label="Issuer" value={bundle.issuer} /> : null}
          {bundle.serialNumber ? <Detail label="Serial" value={bundle.serialNumber} mono /> : null}
          {bundle.type !== "csr" ? (
            <Detail label="Not before" value={formatDate(bundle.notBefore)} />
          ) : null}
          {bundle.type !== "csr" ? (
            <Detail label="Not after" value={formatDate(bundle.notAfter)} />
          ) : null}
          {bundle.fingerprintSha256 ? (
            <Detail
              label="SHA-256"
              value={hexColon(bundle.fingerprintSha256)}
              mono
              onCopy={() => copy("SHA-256 fingerprint", hexColon(bundle.fingerprintSha256))}
              copied={copied === "SHA-256 fingerprint"}
            />
          ) : null}
          {bundle.fingerprintSha1 ? (
            <Detail
              label="SHA-1"
              value={hexColon(bundle.fingerprintSha1)}
              mono
              onCopy={() => copy("SHA-1 fingerprint", hexColon(bundle.fingerprintSha1))}
              copied={copied === "SHA-1 fingerprint"}
            />
          ) : null}
          <Detail
            label="SANs"
            value={bundle.sans.length ? bundle.sans.map((s) => s.value).join(", ") : "None"}
          />
        </dl>
      </section>

      <PemBlock
        title="Certificate"
        value={bundle.certificatePem}
        hidden={false}
        onCopy={() => copy("certificate", bundle.certificatePem)}
        copied={copied === "certificate"}
      />
      {bundle.csrPem ? (
        <PemBlock
          title="Certificate signing request"
          value={bundle.csrPem}
          hidden={false}
          onCopy={() => copy("CSR", bundle.csrPem || "")}
          copied={copied === "CSR"}
        />
      ) : null}
      {bundle.privateKeyPem ? (
        <PemBlock
          title="Private key"
          value={bundle.privateKeyPem}
          hidden={!showKey}
          onToggle={() => setShowKey((v) => !v)}
          onCopy={() => copy("private key", bundle.privateKeyPem || "")}
          copied={copied === "private key"}
        />
      ) : null}
    </div>
  );
}

function DownloadCard({
  title,
  hint,
  warn,
  onClick,
}: {
  title: string;
  hint: string;
  warn?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-line px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-line-strong"
    >
      <p className="font-mono text-sm">{title}</p>
      <p className={`mt-1 text-xs ${warn ? "text-wax" : "text-muted"}`}>{hint}</p>
    </button>
  );
}

function Detail({
  label,
  value,
  mono,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-1 flex items-start gap-2 text-sm">
        <span className={`min-w-0 break-all ${mono ? "font-mono text-[12px]" : ""}`}>{value}</span>
        {onCopy ? (
          <button type="button" onClick={onCopy} className="shrink-0 text-muted hover:text-ink">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </dd>
    </div>
  );
}

function PemBlock({
  title,
  value,
  hidden,
  onToggle,
  onCopy,
  copied,
}: {
  title: string;
  value: string;
  hidden: boolean;
  onToggle?: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  if (!value) return null;
  return (
    <section className="rounded-[28px] border border-line bg-surface p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium">{title}</h3>
        <div className="flex gap-2">
          {onToggle ? (
            <Button variant="ghost" size="sm" onClick={onToggle}>
              {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {hidden ? "Reveal" : "Hide"}
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={onCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy
          </Button>
        </div>
      </div>
      <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-bg-muted p-4 font-mono text-[11px] leading-5 text-ink-soft">
        {hidden ? "••••••••  private key hidden  ••••••••" : value}
      </pre>
    </section>
  );
}

function Wax() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <circle cx="32" cy="32" r="30" className="fill-wax" />
      <circle cx="32" cy="32" r="23" className="fill-none stroke-white/60" strokeWidth="1" />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        className="fill-white"
        style={{ fontFamily: "Georgia, serif", fontSize: "22px" }}
      >
        S
      </text>
    </svg>
  );
}
