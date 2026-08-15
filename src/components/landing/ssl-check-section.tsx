import Link from "next/link";
import { SslCheck } from "@/components/tools/ssl-check";

export function SslCheckSection() {
  return (
    <section id="check" className="border-t border-line bg-bg-muted py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow">SSL checker</p>
            <h2 className="display mt-3 max-w-md text-4xl sm:text-5xl">
              Check a live site&apos;s certificate.
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              Paste a URL. SelfSignedCert opens HTTPS to that host and reads the public
              certificate — issuer, validity, SANs, and days left. We do not
              store the lookup. Private keys are never involved.
            </p>
            <p className="mt-4 text-sm text-muted">
              Prefer a standalone page?{" "}
              <Link href="/tools/check-ssl" className="text-wax hover:underline">
                Open the SSL checker
              </Link>
              .
            </p>
          </div>
          <div className="rounded-[32px] border border-line bg-surface p-5 shadow-lift sm:p-6">
            <SslCheck compact />
          </div>
        </div>
      </div>
    </section>
  );
}
