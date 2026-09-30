import type { Metadata } from "next";
import { PassphraseBox } from "@/components/tools/passphrase-box";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "PFX passphrase generator",
  description:
    "Create a random passphrase for a PKCS#12 file in your browser. The passphrase never leaves the tab.",
  path: "/tools/passphrase",
  keywords: ["PFX password generator", "PKCS12 passphrase", "certificate password generator"],
});

export default function PassphrasePage() {
  return (
    <ToolPage
      path="/tools/passphrase"
      title="PFX passphrase."
      lede="A random password for the .pfx you download from the generator. Created with the browser’s crypto API, then copied by you."
    >
      <PassphraseBox />
    </ToolPage>
  );
}
