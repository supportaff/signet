import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using SelfSignedCert at selfsignedcert.com, a client-side self-signed SSL certificate generator.",
};

export default function TermsPage() {
  return (
    <article className="prose-legal mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">Terms</p>
      <h1 className="display mt-3 text-5xl">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted">Last updated 15 August 2026</p>
      <p className="mt-2 text-sm text-muted">
        These terms apply to SelfSignedCert at {site.url}.
      </p>
      <h2>The service</h2>
      <p>
        SelfSignedCert provides software that runs in your browser to generate
        self-signed SSL certificates, CSRs, Root CAs, host certificates, and
        mTLS client certificates. We do not operate a public certificate
        authority and do not promise that any certificate will be trusted by
        third parties.
      </p>
      <h2>Your responsibility</h2>
      <p>
        You are responsible for protecting downloaded private keys, choosing
        appropriate validity periods, and using certificates only where you
        have the right to do so. A self-signed certificate is not a substitute
        for a publicly trusted CA when one is required.
      </p>
      <h2>No custody</h2>
      <p>
        You acknowledge that SelfSignedCert does not store certificates or
        private keys. We cannot reset, recover, or re-issue material that
        existed only in a browser tab you closed.
      </p>
      <h2>Accounts and plans</h2>
      <p>
        Google sign-in identifies your account. Free, Plus, and Studio limits
        apply to signed-in usage. Guest generation is limited on this device.
        We may refuse or rate-limit abuse of the live SSL checker.
      </p>
      <h2>Limitation</h2>
      <p>
        The software is provided as-is. SelfSignedCert is not liable for
        outages, browser bugs, or damage arising from a lost private key, an
        untrusted certificate, or a misconfigured SAN.
      </p>
      <h2>Contact</h2>
      <p>Questions: {site.supportEmail}.</p>
    </article>
  );
}
