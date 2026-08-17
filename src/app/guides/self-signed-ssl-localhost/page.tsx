import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/guide-article";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "How to create a self-signed SSL certificate for localhost",
  description:
    "Generate a self-signed SSL certificate for localhost HTTPS. Include SANs for localhost and 127.0.0.1. Browsers will still warn until you trust the cert.",
  path: "/guides/self-signed-ssl-localhost",
  keywords: ["localhost SSL", "self signed certificate localhost", "HTTPS localhost"],
});

export default function LocalhostGuidePage() {
  return (
    <GuideArticle
      path="/guides/self-signed-ssl-localhost"
      title="Self-signed SSL for localhost."
      lede="A self-signed certificate is a TLS cert you signed yourself. It is the fastest way to turn on HTTPS for local development."
      steps={[
        { name: "Set the name", text: "Use localhost as the common name and add localhost plus 127.0.0.1 as SANs." },
        { name: "Generate", text: "Create the certificate in the browser and download the .crt and .key." },
        { name: "Point the server", text: "Configure nginx, Caddy, or your framework at those files." },
        { name: "Trust if needed", text: "Browsers will warn until you trust the cert or a local Root CA." },
      ]}
    >
      <h2>What you actually need</h2>
      <p>
        Browsers check Subject Alternative Names, not just the common name. If
        you will open https://localhost, the certificate must list{" "}
        <code>localhost</code> as a DNS SAN. Add <code>127.0.0.1</code> if you
        use the IP.
      </p>
      <h2>How to generate one on SelfSignedCert</h2>
      <p>
        Open the{" "}
        <Link href="/generate" className="text-wax hover:underline">
          self-signed SSL certificate generator
        </Link>
        . Keep the default common name <code>localhost</code> and the default
        SANs. Download the <code>.crt</code> and <code>.key</code>. Point nginx,
        Caddy, Next.js, or your framework at those files.
      </p>
      <h2>Why Chrome still warns</h2>
      <p>
        Self-signed is not publicly trusted. That is expected. Trust the
        certificate in your OS store, or create a{" "}
        <Link href="/guides/local-certificate-authority" className="text-wax hover:underline">
          local Root CA
        </Link>{" "}
        and issue a host certificate instead.
      </p>
    </GuideArticle>
  );
}
