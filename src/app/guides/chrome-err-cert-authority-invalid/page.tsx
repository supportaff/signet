import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/guide-article";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Fix NET::ERR_CERT_AUTHORITY_INVALID on localhost",
  description:
    "Chrome shows NET::ERR_CERT_AUTHORITY_INVALID when it does not trust the issuer. How to fix a lab or localhost cert without disabling security.",
  path: "/guides/chrome-err-cert-authority-invalid",
  keywords: ["NET::ERR_CERT_AUTHORITY_INVALID", "Chrome certificate error localhost", "ERR_CERT_AUTHORITY_INVALID"],
});

export default function ChromeErrorGuide() {
  return (
    <GuideArticle
      path="/guides/chrome-err-cert-authority-invalid"
      title="Fix NET::ERR_CERT_AUTHORITY_INVALID."
      lede="Chrome is telling you the issuer is not in the trust store. That is expected for a self-signed cert. Do not turn off HTTPS. Trust the right CA."
      steps={[
        { name: "Confirm the name", text: "The certificate SAN must include the hostname you typed, usually localhost." },
        { name: "Prefer a Root CA", text: "Generate a Root CA, trust that once, then issue a host cert." },
        { name: "Install the CA", text: "Add ca.crt to the OS trust store on Windows, macOS, or Linux." },
        { name: "Restart the browser", text: "Chrome caches trust decisions until restart." },
      ]}
    >
      <h2>What the error actually means</h2>
      <p>
        The handshake succeeded. The name may even match. Chrome still rejects the issuer because it is not a
        public CA. That is the correct default on the public internet and a nuisance on a homelab.
      </p>
      <h2>The wrong fix</h2>
      <p>
        Do not enable Chrome flags that ignore certificate errors. That trains you to click through real
        attacks. Do not email the private key to a “fix my SSL” form.
      </p>
      <h2>The right fix</h2>
      <p>
        <Link href="/generate" className="text-wax hover:underline">
          Generate a Root CA
        </Link>
        , then a host certificate for the name you use. Trust the CA once:
      </p>
      <ul>
        <li>
          <Link href="/guides/trust-self-signed-windows" className="text-wax hover:underline">
            Windows
          </Link>
        </li>
        <li>
          <Link href="/guides/trust-self-signed-macos" className="text-wax hover:underline">
            macOS
          </Link>
        </li>
        <li>
          <Link href="/guides/trust-self-signed-linux" className="text-wax hover:underline">
            Linux
          </Link>
        </li>
      </ul>
    </GuideArticle>
  );
}
