import type { Metadata } from "next";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "SelfSignedCert is a free self-signed SSL certificate generator. We do not operate a CA and we do not store keys.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <article className="prose-legal mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">About</p>
      <h1 className="display mt-3 text-5xl">A workshop, not a vault.</h1>
      <p className="mt-6 text-lg text-ink-soft">
        SelfSignedCert exists because the internet is full of “generate a
        certificate” forms that quietly take possession of a private key. That
        is an architectural mistake. We refused to make it.
      </p>
      <h2>What we are</h2>
      <p>
        A free online generator for self-signed SSL certificates, localhost
        HTTPS, mTLS client certificates, Root CAs, host certificates, and
        certificate signing requests. The cryptography runs on your device at{" "}
        {site.url.replace("https://", "")}. The files you download were assembled
        in this tab.
      </p>
      <h2>What we are not</h2>
      <p>
        We are not a public certificate authority. We do not issue certificates
        that browsers will trust by default. We do not escrow keys. We do not
        “sync your certificates to the cloud.”
      </p>
      <h2>Why the name</h2>
      <p>
        SelfSignedCert is the product and the domain. The name is the job:
        create a self-signed certificate without sending the private key
        anywhere. No metaphor required.
      </p>
    </article>
  );
}
