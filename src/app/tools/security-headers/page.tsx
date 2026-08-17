import type { Metadata } from "next";
import { HeadersTool } from "@/components/tools/headers-tool";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "HSTS and security headers checker",
  description:
    "Check HSTS, CSP, X-Frame-Options, and related headers on a public HTTPS site. We connect to port 443 only.",
  path: "/tools/security-headers",
  keywords: ["HSTS checker", "security headers checker", "CSP checker"],
});

export default function SecurityHeadersPage() {
  return (
    <ToolPage
      path="/tools/security-headers"
      title="HSTS and security headers."
      lede="We open HTTPS to the hostname you type and read response headers. Private addresses are blocked. We do not store the lookup."
    >
      <HeadersTool />
    </ToolPage>
  );
}
