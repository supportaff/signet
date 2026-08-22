import type { Metadata } from "next";
import { SubdomainTool } from "@/components/tools/recon-tools";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Subdomain finder — Certificate Transparency",
  description:
    "Find public subdomains for a domain from Certificate Transparency logs and a short DNS guess list. Private and reserved hosts are blocked.",
  path: "/tools/subdomains",
  keywords: ["subdomain finder", "subdomain enumerator", "certificate transparency subdomains"],
});

export default function SubdomainsPage() {
  return (
    <ToolPage
      path="/tools/subdomains"
      title="Subdomain finder."
      lede="Enter a public domain. We read Certificate Transparency (names that appeared on public certs) and try a few common DNS labels. This is public issuance data — not a stealth scan of your lab."
    >
      <SubdomainTool />
    </ToolPage>
  );
}
