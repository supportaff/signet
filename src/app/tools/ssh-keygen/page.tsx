import type { Metadata } from "next";
import { SshBox } from "@/components/tools/ssh-box";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "SSH key generator in the browser",
  description:
    "Generate an RSA or ECDSA SSH key pair in your browser. The private key never uploads.",
  path: "/tools/ssh-keygen",
  keywords: ["SSH key generator", "generate SSH key online", "ssh-keygen online"],
});

export default function SshKeygenPage() {
  return (
    <ToolPage
      path="/tools/ssh-keygen"
      title="SSH key generator."
      lede="Mint an RSA or ECDSA key pair with Web Crypto in this tab. Copy the OpenSSH public key. The private PEM never leaves the device."
    >
      <SshBox />
    </ToolPage>
  );
}
