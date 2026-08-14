import type { Metadata } from "next";
import { GeneratorApp } from "@/components/generator/generator-app";
import { PracticeNotes } from "@/components/generator/practice-notes";
import { TypeGuide } from "@/components/generator/type-guide";

export const metadata: Metadata = {
  title: "Generate a certificate",
  description:
    "Create a Root CA, CA-signed host certificate, self-signed TLS cert, mTLS client certificate, or CSR entirely in your browser. Private keys never leave this tab.",
};

export default function GeneratePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <p className="eyebrow">Generator</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">Forge a certificate.</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Everything below runs in this tab. Signet does not receive your common name,
        your key, or the finished files. Download before you leave.
      </p>
      <div className="mt-8">
        <TypeGuide />
        <GeneratorApp />
        <PracticeNotes />
      </div>
    </div>
  );
}
