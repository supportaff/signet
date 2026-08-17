"use client";

import { UrlTool } from "@/components/tools/live-lookup";

type Payload = {
  host?: { hostname: string };
  status?: number;
  findings?: { name: string; ok: boolean; detail: string }[];
};

export function HeadersTool() {
  return (
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
  );
}
