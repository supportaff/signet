import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Signet does not store certificates, private keys, CSRs, or PFX files. Generation is entirely client-side.",
};

export default function PrivacyPage() {
  return (
    <article className="prose-legal mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">Privacy</p>
      <h1 className="display mt-3 text-5xl">We cannot leak what we never receive.</h1>
      <p className="mt-4 text-sm text-muted">Last updated 14 August 2026</p>
      <h2>The short version</h2>
      <p>
        Certificate generation happens 100% in your browser. Signet does not
        upload, store, log, or back up certificates, private keys, CSRs, PFX
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
        If you use the dashboard, Signet can keep a metadata history in
        <em> your</em> local storage: common name, SANs, algorithm, timestamps,
        and fingerprints. That data is not a backup of the certificate. Clearing
        site data removes it. We cannot recover a private key from it.
      </p>
      <h2>Accounts (this demo)</h2>
      <p>
        The current build uses dummy authentication stored in local storage on
        this device. There is no production identity provider attached. When a
        hosted account system ships, it will authenticate people — not custody
        their keys.
      </p>
      <h2>Analytics and contact</h2>
      <p>
        A production deployment may collect anonymous traffic metrics and the
        contents of messages you send via the contact form. Those channels are
        unrelated to certificate issuance.
      </p>
      <h2>Ask us</h2>
      <p>
        Privacy questions: hello@signet.dev. If you need a DPA or a written
        architecture note for a security review, ask. The answer will still be:
        we do not hold the material.
      </p>
    </article>
  );
}
