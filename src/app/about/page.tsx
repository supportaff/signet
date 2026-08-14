import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Signet is a client-side certificate workshop. We do not operate a CA and we do not store keys.",
};

export default function AboutPage() {
  return (
    <article className="prose-legal mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">About</p>
      <h1 className="display mt-3 text-5xl">A workshop, not a vault.</h1>
      <p className="mt-6 text-lg text-ink-soft">
        Signet exists because the internet is full of “generate a certificate”
        forms that quietly take possession of a private key. That is an
        architectural mistake. We refused to make it.
      </p>
      <h2>What we are</h2>
      <p>
        A browser-native workshop for self-signed TLS certificates, mTLS client
        certificates, and certificate signing requests. The cryptography runs
        on your device. The files you download were assembled in this tab.
      </p>
      <h2>What we are not</h2>
      <p>
        We are not a public certificate authority. We do not issue certificates
        that browsers will trust by default. We do not escrow keys. We do not
        “sync your certificates to the cloud.”
      </p>
      <h2>Why the name</h2>
      <p>
        A signet was a ring used to seal a letter. The impression was made in
        the owner’s presence. The wax cooled in their hand. That is the
        posture we want for keys: created where you stand, never mailed away
        to be stamped by a stranger.
      </p>
      <h2>The Certify question</h2>
      <p>
        The working title was Certify. We chose Signet because it is specific,
        quieter, and harder to confuse with a public CA. The product is the
        same: local issuance with nothing left on our side.
      </p>
    </article>
  );
}
