import type { Metadata } from "next";
import { GeneratorApp } from "@/components/generator/generator-app";
import { PracticeNotes } from "@/components/generator/practice-notes";
import { TypeGuide } from "@/components/generator/type-guide";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Self-signed SSL & CSR generator (localhost, mTLS, Root CA)",
  description:
    "Free online certificate generator: self-signed SSL for localhost, CSR, Root CA, host certificates, and mTLS client certs. Private keys never leave the browser.",
  path: "/generate",
  keywords: ["self signed certificate generator", "CSR generator", "localhost SSL generator"],
});

export default function GeneratePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <p className="eyebrow">Generator</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">Online SSL certificate generator.</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Create a self-signed SSL certificate, localhost HTTPS cert, CSR, Root CA,
        host certificate, or mTLS client certificate. Everything runs in this tab.
        Download before you leave.
      </p>
      <div className="mt-8">
        <TypeGuide />
        <GeneratorApp />
        <PracticeNotes />
      </div>
    </div>
  );
}
