import type { Metadata } from "next";
import Link from "next/link";
import { InspectBox } from "@/components/tools/inspect-box";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "CSR decoder — inspect a certificate signing request",
  description:
    "Decode a CSR online in your browser. Check the subject before you send the request to a CA. The PEM stays on this device.",
  path: "/tools/decode-csr",
  keywords: ["CSR decoder", "decode certificate signing request", "inspect CSR"],
});

export default function DecodeCsrPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="eyebrow">Free tool</p>
      <h1 className="display mt-3 text-5xl">CSR decoder.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        Paste a certificate signing request. Confirm the common name and
        subject before a public or company CA signs it. Never paste the
        matching private key here — or anywhere.
      </p>
      <div className="mt-8">
        <InspectBox kind="csr" />
      </div>
      <p className="mt-8 text-sm text-muted">
        Need a CSR?{" "}
        <Link href="/generate" className="text-wax hover:underline">
          Generate a CSR online
        </Link>{" "}
        without uploading the key.
      </p>
    </div>
  );
}
