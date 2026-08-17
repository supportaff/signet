"use client";

import { UrlTool } from "@/components/tools/live-lookup";

type Payload = {
  entries?: { commonName: string; issuer: string; notBefore: string; notAfter: string; names: string[] }[];
};

export function CtTool() {
  return (
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
  );
}
