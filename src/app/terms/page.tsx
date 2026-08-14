import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using Signet, a client-side certificate generation workshop.",
};

export default function TermsPage() {
  return (
    <article className="prose-legal mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">Terms</p>
      <h1 className="display mt-3 text-5xl">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted">Last updated 14 August 2026</p>
      <h2>The service</h2>
      <p>
        Signet provides software that runs in your browser to generate
        cryptographic material. We do not operate a public certificate
        authority and do not promise that any certificate will be trusted by
        third parties.
      </p>
      <h2>Your responsibility</h2>
      <p>
        You are responsible for protecting downloaded private keys, choosing
        appropriate validity periods, and using certificates only where you
        have the right to do so. Self-signed certificates are not a substitute
        for a publicly trusted CA when one is required.
      </p>
      <h2>No custody</h2>
      <p>
        You acknowledge that Signet does not store certificates or private
        keys. We cannot reset, recover, or re-issue material that existed only
        in a browser tab you closed.
      </p>
      <h2>Demo accounts</h2>
      <p>
        Authentication in this build is a local demonstration. Do not reuse a
        real production password. Paid billing is not connected.
      </p>
      <h2>Limitation</h2>
      <p>
        The software is provided as-is. We are not liable for outages,
        browser bugs, or damage arising from a lost private key, an untrusted
        certificate, or a misconfigured SAN.
      </p>
    </article>
  );
}
