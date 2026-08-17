import type { Metadata } from "next";
import { UrlTool } from "@/components/tools/live-lookup";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Certificate Transparency lookup by domain",
  description:
    "Look up recently logged public certificates for a domain via Certificate Transparency. Useful for spotting unexpected issuance.",
  path: "/tools/ct-lookup",
  keywords: ["certificate transparency lookup", "crt.sh alternative", "CT log search"],
});

type Payload = {
  domain?: string;
  entries?: { commonName: string; issuer: string; notBefore: string; notAfter: string; names: string[] }[];
};

export default function CtLookupPage() {
  return (
    <ToolPage
      path="/tools/ct-lookup"
      title="Certificate Transparency lookup."
      lede="Search public CT logs for a domain. This is public issuance history — not your private lab certs."
    >
      <UrlTool action="/api/tools/ct-lookup" placeholder="example.com" label="Search CT logs">
        {(raw) => {
          const data = raw as Payload;
          return (
            <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
              {(data.entries || []).map((entry, index) => (
                <li key={`${entry.commonName}-${index}`} className="px-5 py-3 text-sm">
                  <p className="font-medium">{entry.commonName || entry.names?.[0] || "certificate"}</p>
                  <p className="mt-1 text-xs text-muted">{entry.issuer}</p>
                  <p className="mt-1 text-xs text-muted">
                    {entry.notBefore} → {entry.notAfter}
                  </p>
                </li>
              ))}
            </ul>
          );
        }}
      </UrlTool>
    </ToolPage>
  );
}
