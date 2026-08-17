import type { Metadata } from "next";
import { CtTool } from "@/components/tools/ct-tool";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Certificate Transparency lookup by domain",
  description:
    "Look up recently logged public certificates for a domain via Certificate Transparency. Useful for spotting unexpected issuance.",
  path: "/tools/ct-lookup",
  keywords: ["certificate transparency lookup", "crt.sh alternative", "CT log search"],
});

export default function CtLookupPage() {
  return (
    <ToolPage
      path="/tools/ct-lookup"
      title="Certificate Transparency lookup."
      lede="Search public CT logs for a domain. This is public issuance history — not your private lab certs."
    >
      <CtTool />
    </ToolPage>
  );
}
