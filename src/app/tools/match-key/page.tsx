import type { Metadata } from "next";
import { MatchKeyBox } from "@/components/tools/match-key-box";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Match a certificate to a private key",
  description:
    "Check whether an RSA private key matches a certificate or CSR. The comparison runs in your browser. Nothing is uploaded.",
  path: "/tools/match-key",
  keywords: ["certificate key match", "check private key matches certificate", "CSR public key match"],
});

export default function MatchKeyPage() {
  return (
    <ToolPage
      path="/tools/match-key"
      title="Does this key match?"
      lede="Paste a certificate or CSR and the RSA key you think belongs to it. The check compares the public key in this tab."
    >
      <MatchKeyBox />
    </ToolPage>
  );
}
