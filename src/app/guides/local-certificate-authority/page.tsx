import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Create a local certificate authority and sign host certs",
  description:
    "Build a private Root CA in your browser, trust it once, then issue host certificates for internal HTTPS. No OpenSSL required.",
  path: "/guides/local-certificate-authority",
  keywords: ["local certificate authority", "root CA generator", "sign host certificate"],
});

export default function LocalCaGuidePage() {
  return (
    <article className="prose-legal mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">Guide</p>
      <h1 className="display mt-3 text-5xl">A local CA, then host certs.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        Trusting a new self-signed cert on every laptop does not scale. A Root
        CA is one trust decision. Host certificates are the leaves you put on
        servers.
      </p>
      <h2>The three steps</h2>
      <p>
        1.{" "}
        <Link href="/generate" className="text-wax hover:underline">
          Generate a Root CA
        </Link>
        . Download <code>ca.crt</code> and keep <code>ca.key</code> offline.
      </p>
      <p>
        2. Install <code>ca.crt</code> in the OS or browser trust store.
      </p>
      <p>
        3. Issue a host certificate for each hostname. SelfSignedCert can use the CA
        still sitting in this tab, or you can paste the CA PEM.
      </p>
      <h2>Do not put the CA key on the web server</h2>
      <p>
        Anyone with the CA private key can impersonate every host you issue.
        The host <code>.key</code> belongs on the server. The CA key does not.
      </p>
    </article>
  );
}
