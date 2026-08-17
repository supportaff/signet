import type { Metadata } from "next";
import { GuideArticle } from "@/components/guides/guide-article";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Trust a self-signed certificate on Linux",
  description:
    "Install a private Root CA into the system trust store on Debian, Ubuntu, RHEL, Fedora, and Arch.",
  path: "/guides/trust-self-signed-linux",
  keywords: ["trust self signed certificate Linux", "update-ca-certificates", "local CA Linux"],
});

export default function LinuxTrustGuide() {
  return (
    <GuideArticle
      path="/guides/trust-self-signed-linux"
      title="Trust a self-signed certificate on Linux."
      lede="Browsers and curl both honor the system bundle once the CA is installed. Copy ca.crt, then update the store."
      steps={[
        { name: "Copy the CA", text: "Place ca.crt in the distribution’s CA directory." },
        { name: "Debian / Ubuntu", text: "sudo cp ca.crt /usr/local/share/ca-certificates/lab.crt && sudo update-ca-certificates" },
        { name: "RHEL / Fedora", text: "sudo cp ca.crt /etc/pki/ca-trust/source/anchors/ && sudo update-ca-trust" },
        { name: "Arch", text: "sudo trust anchor ca.crt" },
      ]}
    >
      <h2>Firefox</h2>
      <p>
        Firefox on Linux may use its own NSS database. Import the CA in Settings → Privacy → Certificates if
        system trust does not take.
      </p>
      <h2>Do not</h2>
      <p>
        Do not set <code>SSL_CERT_FILE</code> to the host leaf. Do not disable certificate verification in
        production code to “make localhost work.”
      </p>
    </GuideArticle>
  );
}
