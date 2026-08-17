import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/guide-article";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Trust a self-signed certificate on Windows",
  description:
    "Install a local Root CA in the Windows Trusted Root store so Chrome and Edge stop warning on lab HTTPS.",
  path: "/guides/trust-self-signed-windows",
  keywords: ["trust self signed certificate Windows", "install root CA Windows", "mmc certificates"],
});

export default function WindowsTrustGuide() {
  return (
    <GuideArticle
      path="/guides/trust-self-signed-windows"
      title="Trust a self-signed certificate on Windows."
      lede="Install the Root CA, not every leaf. Chrome and Edge on Windows read the system store."
      steps={[
        { name: "Generate a CA", text: "Create a Root CA in the SelfSignedCert generator and download ca.crt." },
        { name: "Open certmgr", text: "Run certlm.msc as admin for the machine store, or certmgr.msc for the user store." },
        { name: "Import", text: "Trusted Root Certification Authorities → Certificates → All Tasks → Import. Select ca.crt." },
        { name: "Restart browsers", text: "Close every Chrome/Edge window, then reopen the lab URL." },
      ]}
    >
      <h2>Machine store vs user store</h2>
      <p>
        Services and other users need the machine store (<code>certlm.msc</code>). A single developer laptop can
        use the current-user store. Do not import a host leaf into Trusted Root.
      </p>
      <p>
        Need the files first?{" "}
        <Link href="/guides/local-certificate-authority" className="text-wax hover:underline">
          Make a local CA
        </Link>{" "}
        then{" "}
        <Link href="/generate" className="text-wax hover:underline">
          issue a host cert
        </Link>
        .
      </p>
    </GuideArticle>
  );
}
