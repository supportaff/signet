import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/guide-article";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "OpenSSL vs an online certificate generator",
  description:
    "Use OpenSSL in scripts. Use a browser generator only if the private key never leaves the tab. How SelfSignedCert differs from upload-a-key websites.",
  path: "/guides/openssl-vs-online-generator",
  keywords: ["openssl vs online generator", "generate SSL without openssl", "safe online certificate generator"],
});

export default function OpensslCompareGuide() {
  return (
    <GuideArticle
      path="/guides/openssl-vs-online-generator"
      title="OpenSSL vs an online generator."
      lede="OpenSSL is the right tool in CI. A website that asks for your private key is the wrong tool everywhere. A generator that never sees the key is a workshop, not a CA."
      steps={[
        { name: "Scripts stay on OpenSSL", text: "Ansible, Terraform, and build pipelines should call openssl or step-ca." },
        { name: "Interactive work can be local JS", text: "Minting one localhost cert or a CSR does not require installing a toolchain." },
        { name: "Never upload a key", text: "If the form posts a .key, close it. SelfSignedCert keeps generation in the tab." },
      ]}
    >
      <h2>What we produce</h2>
      <p>
        The same PEM, CSR, and PFX shapes OpenSSL writes.{" "}
        <Link href="/tools/openssl" className="text-wax hover:underline">
          Equivalent commands
        </Link>{" "}
        are on the cheat sheet if you want both.
      </p>
      <p>
        <Link href="/generate" className="text-wax hover:underline">
          Generate in the browser
        </Link>{" "}
        when you are on a machine that does not have OpenSSL, or you do not want to fight config files for a
        one-off SAN.
      </p>
    </GuideArticle>
  );
}
