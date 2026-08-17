import type { Metadata } from "next";
import { UrlTool } from "@/components/tools/live-lookup";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "HSTS and security headers checker",
  description:
    "Check HSTS, CSP, X-Frame-Options, and related headers on a public HTTPS site. We connect to port 443 only.",
  path: "/tools/security-headers",
  keywords: ["HSTS checker", "security headers checker", "CSP checker"],
});

type Payload = {
  host?: { hostname: string };
  status?: number;
  findings?: { name: string; ok: boolean; detail: string }[];
};

export default function SecurityHeadersPage() {
  return (
    <ToolPage
      path="/tools/security-headers"
      title="HSTS and security headers."
      lede="We open HTTPS to the hostname you type and read response headers. Private addresses are blocked. We do not store the lookup."
    >
      <UrlTool action="/api/tools/check-headers" placeholder="example.com" label="Check headers">
        {(raw) => {
          const data = raw as Payload;
          return (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                {data.host?.hostname} · HTTP {data.status}
              </p>
              <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
                {(data.findings || []).map((finding) => (
                  <li key={finding.name} className="px-5 py-3">
                    <p className="font-medium">
                      {finding.ok ? "Pass" : "Gap"} · {finding.name}
                    </p>
                    <p className="mt-1 break-all font-mono text-[12px] text-muted">{finding.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        }}
      </UrlTool>
    </ToolPage>
  );
}
