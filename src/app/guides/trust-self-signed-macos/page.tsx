import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/guide-article";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Trust a self-signed certificate on macOS",
  description:
    "Add a local Root CA to Keychain Access and set it to Always Trust so Safari and Chrome stop warning.",
  path: "/guides/trust-self-signed-macos",
  keywords: ["trust self signed certificate macOS", "Keychain Access root CA", "Safari localhost HTTPS"],
});

export default function MacTrustGuide() {
  return (
    <GuideArticle
      path="/guides/trust-self-signed-macos"
      title="Trust a self-signed certificate on macOS."
      lede="Keychain Access is the trust store Safari uses. Chrome on macOS follows it too."
      steps={[
        { name: "Download ca.crt", text: "Generate a Root CA in the browser and keep ca.key offline." },
        { name: "Open Keychain Access", text: "File → Import Items → choose ca.crt → login or System keychain." },
        { name: "Always Trust", text: "Double-click the cert → Trust → When using this certificate: Always Trust." },
        { name: "Restart", text: "Quit browsers fully, then reload https://localhost." },
      ]}
    >
      <h2>System vs login keychain</h2>
      <p>
        System requires an admin password and applies to every account. Login is enough for one operator.
        Firefox has its own store — import there separately if you use it.
      </p>
      <p>
        <Link href="/guides/chrome-err-cert-authority-invalid" className="text-wax hover:underline">
          Still seeing ERR_CERT_AUTHORITY_INVALID?
        </Link>
      </p>
    </GuideArticle>
  );
}
