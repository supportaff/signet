import type { Metadata } from "next";
import { ExpiryBox } from "@/components/tools/expiry-box";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Bulk SSL expiry checker — days left on several hosts",
  description:
    "Check certificate expiry on up to eight public hostnames. We read public certificates only.",
  path: "/tools/ssl-expiry",
  keywords: ["SSL expiry checker", "certificate expiration monitor", "bulk SSL check"],
});

export default function SslExpiryPage() {
  return (
    <ToolPage
      path="/tools/ssl-expiry"
      title="Bulk SSL expiry monitor."
      lede="Paste up to eight public hostnames. Each check is a live TLS handshake. We do not store the list."
    >
      <ExpiryBox />
    </ToolPage>
  );
}
