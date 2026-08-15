import type { Metadata } from "next";
import Link from "next/link";
import { SslCheck } from "@/components/tools/ssl-check";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "SSL certificate checker — inspect a live site",
  description:
    "Check a website’s SSL certificate online. See issuer, validity dates, SANs, expiry, and whether the hostname matches. We read the public cert only and do not store the lookup.",
  path: "/tools/check-ssl",
  keywords: [
    "SSL checker",
    "check SSL certificate",
    "SSL certificate expiry",
    "website certificate validity",
    "TLS certificate checker",
  ],
});

export default async function CheckSslPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; host?: string }>;
}) {
  const query = await searchParams;
  const initialUrl = query.url || query.host || "";

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="eyebrow">Free tool</p>
      <h1 className="display mt-3 text-5xl">SSL certificate checker.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        Enter a hostname or URL. Signet completes a TLS handshake with that host
        and shows the public leaf certificate — subject, issuer, dates, SANs,
        and fingerprints. This is the one tool that leaves your browser: we
        connect to the site you name. We do not store the lookup, and no private
        key is ever sent.
      </p>
      <div className="mt-8">
        <SslCheck initialUrl={initialUrl} />
      </div>
      <p className="mt-8 text-sm text-muted">
        Already have a PEM file?{" "}
        <Link href="/tools/decode-certificate" className="text-wax hover:underline">
          Decode a certificate locally
        </Link>{" "}
        or{" "}
        <Link href="/generate" className="text-wax hover:underline">
          generate a new self-signed SSL certificate
        </Link>
        .
      </p>
    </div>
  );
}
