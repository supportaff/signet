import type { Metadata } from "next";
import { ChainBox } from "@/components/tools/chain-box";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Certificate chain validator — find a missing intermediate",
  description:
    "Paste a leaf, intermediates, and root. SelfSignedCert checks order, expiry, and signatures in your browser.",
  path: "/tools/validate-chain",
  keywords: ["certificate chain validator", "missing intermediate certificate", "SSL chain check"],
});

export default function ValidateChainPage() {
  return (
    <ToolPage
      path="/tools/validate-chain"
      title="Certificate chain validator."
      lede="Paste the leaf first, then intermediates, then the root. We verify signatures and call out a missing issuer. Nothing is uploaded."
    >
      <ChainBox />
    </ToolPage>
  );
}
