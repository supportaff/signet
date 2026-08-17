import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle } from "@/components/guides/guide-article";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "mkcert alternative — local CA in the browser",
  description:
    "mkcert installs a local CA on one machine. SelfSignedCert mints the same kinds of files in the browser without installing a binary — and never uploads the key.",
  path: "/guides/mkcert-alternative",
  keywords: ["mkcert alternative", "mkcert online", "local CA without mkcert"],
});

export default function MkcertGuide() {
  return (
    <GuideArticle
      path="/guides/mkcert-alternative"
      title="A browser alternative to mkcert."
      lede="mkcert is excellent when you want one laptop trusted automatically. Use SelfSignedCert when you need the PEMs, a CA you can copy to a NAS, or you do not want another binary."
      steps={[
        { name: "Forge a Root CA", text: "Generate the CA in the tab and download ca.crt plus ca.key." },
        { name: "Trust it yourself", text: "Install ca.crt on each OS you care about. mkcert does this for one machine; you do it deliberately." },
        { name: "Issue host certs", text: "Mint a host certificate per hostname, same as mkcert example.test." },
      ]}
    >
      <h2>When mkcert wins</h2>
      <p>One developer Mac or Linux box. You want Firefox and the system store updated in one command.</p>
      <h2>When this site wins</h2>
      <p>
        You are on a jump host, a locked-down Windows box, or you need a CA that will also live on Proxmox,
        UniFi, or a Cisco web UI.{" "}
        <Link href="/generate" className="text-wax hover:underline">
          Generate the files
        </Link>{" "}
        and keep the key. No install, no upload.
      </p>
    </GuideArticle>
  );
}
