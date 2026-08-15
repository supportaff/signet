import type { Metadata } from "next";
import Link from "next/link";
import { InspectBox } from "@/components/tools/inspect-box";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "SSL certificate decoder — inspect PEM online",
  description:
    "Decode an SSL/TLS certificate in your browser. View subject, SANs, validity, and SHA-256 fingerprint. The PEM never leaves this tab.",
  path: "/tools/decode-certificate",
  keywords: ["SSL certificate decoder", "decode PEM certificate", "x509 decoder"],
});

export default function DecodeCertificatePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="eyebrow">Free tool</p>
      <h1 className="display mt-3 text-5xl">SSL certificate decoder.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        Paste a PEM certificate (the block that starts with BEGIN CERTIFICATE).
        Signet parses it with the same browser library used to generate certs.
        We do not upload the file.
      </p>
      <div className="mt-8">
        <InspectBox kind="certificate" />
      </div>
      <p className="mt-8 text-sm text-muted">
        Checking a live website instead?{" "}
        <Link href="/tools/check-ssl" className="text-wax hover:underline">
          Inspect a site certificate
        </Link>
        . Need a new file instead?{" "}
        <Link href="/generate" className="text-wax hover:underline">
          Generate a self-signed SSL certificate
        </Link>{" "}
        or{" "}
        <Link href="/tools/decode-csr" className="text-wax hover:underline">
          decode a CSR
        </Link>
        .
      </p>
    </div>
  );
}
