import dns from "node:dns/promises";
import { assertAllowedHost, parseHostname, SslCheckError } from "@/lib/ssl-check";

export interface CaaRecordView {
  name: string;
  critical: boolean;
  tag: string;
  value: string;
}

type CaaRow = {
  critical: number;
  issue?: string;
  issuewild?: string;
  iodef?: string;
  contactemail?: string;
  contactphone?: string;
};

const TAGS = ["issue", "issuewild", "iodef", "contactemail", "contactphone"] as const;

function recordsFrom(name: string, row: CaaRow): CaaRecordView[] {
  return TAGS.flatMap((tag) => {
    const value = row[tag];
    if (!value) return [];
    return [{ name, critical: row.critical === 128, tag, value }];
  });
}

export async function lookupCaa(input: string) {
  const domain = parseHostname(input);
  assertAllowedHost(domain);
  if (domain.split(".").length < 2) {
    throw new SslCheckError(400, "Enter a public domain, like example.com.");
  }

  const labels = domain.split(".");
  const checked: string[] = [];
  for (let index = 0; index < labels.length - 1; index += 1) {
    const name = labels.slice(index).join(".");
    checked.push(name);
    try {
      const rows = (await dns.resolveCaa(name)) as CaaRow[];
      const records = rows.flatMap((row) => recordsFrom(name, row));
      if (records.length) {
        return { domain, matched: name, checked, records };
      }
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "ENODATA" || code === "ENOTFOUND" || code === "ENOTIMP") continue;
      if (code === "ESERVFAIL" || code === "ETIMEOUT") {
        throw new SslCheckError(502, "DNS did not answer for that domain.");
      }
    }
  }

  return {
    domain,
    matched: null,
    checked,
    records: [] as CaaRecordView[],
  };
}
