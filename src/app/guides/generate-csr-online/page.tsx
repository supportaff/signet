import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/guide-article";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Generate a CSR online without uploading the private key",
  description:
    "Create a certificate signing request (CSR) in your browser. Send only the .csr to your CA. The private key stays on your device.",
  path: "/guides/generate-csr-online",
  keywords: ["generate CSR online", "certificate signing request generator"],
});

export default function CsrGuidePage() {
  return (
    <GuideArticle
      path="/guides/generate-csr-online"
      title="Generate a CSR online."
      lede="A CSR is not a certificate. It is a signed request that carries your public key and identity. A CA turns it into a trusted cert."
      steps={[
        { name: "Generate locally", text: "Create the key and CSR in the browser." },
        { name: "Send only the CSR", text: "Give the CA the .csr. Keep the .key." },
        { name: "Install the reply", text: "Pair the issued .crt with the same key." },
      ]}
    >
      <h2>Never send the private key</h2>
      <p>
        The CA only needs the <code>.csr</code>. If a site asks you to upload
        the <code>.key</code>, leave.{" "}
        <Link href="/generate" className="text-wax hover:underline">
          SelfSignedCert&apos;s CSR generator
        </Link>{" "}
        creates both in this tab and never posts them.
      </p>
      <h2>After the CA replies</h2>
      <p>
        Pair the issued <code>.crt</code> with the same key you generated here.
        If you lost the key, the cert is useless. Decode a CSR first with the{" "}
        <Link href="/tools/decode-csr" className="text-wax hover:underline">
          CSR decoder
        </Link>{" "}
        if you want to check the subject.
      </p>
    </GuideArticle>
  );
}
