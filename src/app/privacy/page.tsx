import type { Metadata } from "next";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy",
  description:
    "SelfSignedCert does not store certificates, private keys, CSRs, or PFX files. Generation is entirely client-side at selfsignedcert.com.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="prose-legal mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">Privacy</p>
      <h1 className="display mt-3 text-5xl">We cannot leak what we never receive.</h1>
      <p className="mt-4 text-sm text-muted">Last updated 15 August 2026</p>
      <p className="mt-2 text-sm text-muted">
        Operator: SelfSignedCert · {site.url}
      </p>
      <h2>The short version</h2>
      <p>
        Certificate generation happens 100% in your browser. SelfSignedCert does
        not upload, store, log, or back up certificates, private keys, CSRs, PFX
        files, or passphrases. If our servers were emptied tomorrow, your keys
        would not be on them — they were never there.
      </p>
      <h2>What never leaves the device</h2>
      <ul>
        <li>Private keys</li>
        <li>Certificate PEMs, DERs, and PKCS#12 bundles</li>
        <li>Certificate signing requests</li>
        <li>PFX passwords</li>
        <li>The form values used to mint a certificate, unless you choose to keep local metadata</li>
      </ul>
      <h2>What may live in this browser</h2>
      <p>
        If you use the dashboard, SelfSignedCert can keep a metadata history in
        <em> your</em> local storage: common name, SANs, algorithm, timestamps,
        and fingerprints. That data is not a backup of the certificate. Clearing
        site data removes it. We cannot recover a private key from it.
      </p>
      <h2>Accounts</h2>
      <p>
        You can sign in with Google. We store your Google account id, name,
        email, plan, usage count, and login times so we can apply Free / Plus /
        Studio limits. That account data is not a certificate and is not a
        private key. You can delete the account from Settings.
      </p>
      <h2>Live SSL checks</h2>
      <p>
        The SSL checker is the one tool that leaves your browser: we open a TLS
        connection to the public hostname you type and read the certificate that
        site presents. We do not store the lookup. Private keys are never sent.
      </p>
      <h2>Payments</h2>
      <p>
        Paid plans are processed by Dodo Payments when checkout is enabled.
        SelfSignedCert receives plan and payment metadata only — never card
        numbers and never private keys.
      </p>
      <h2>Analytics and contact</h2>
      <p>
        We may collect anonymous traffic metrics and the contents of messages
        you send via the contact form. Those channels are unrelated to
        certificate issuance. Do not paste a private key into a message.
      </p>
      <h2>Ask us</h2>
      <p>
        Privacy questions: {site.supportEmail}. If you need a DPA or a written
        architecture note for a security review, ask. The answer will still be:
        we do not hold the material.
      </p>
    </article>
  );
}
