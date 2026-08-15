import type { Metadata } from "next";
import { site } from "@/lib/site";

export const seoKeywords = [
  "self signed certificate generator",
  "self signed SSL certificate online",
  "localhost SSL certificate",
  "HTTPS for localhost",
  "CSR generator online",
  "certificate signing request generator",
  "mTLS client certificate generator",
  "mutual TLS certificate",
  "root CA generator",
  "local certificate authority",
  "host certificate generator",
  "PFX generator online",
  "PKCS12 generator",
  "SSL checker",
  "check SSL certificate online",
  "SSL certificate expiry checker",
  "website certificate validity",
  "PEM certificate decoder",
  "decode SSL certificate",
  "decode CSR online",
  "OpenSSL alternative online",
  "generate SSL without OpenSSL",
  "SAN certificate generator",
  "wildcard localhost certificate",
];

export function pageMeta({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    keywords: [...seoKeywords.slice(0, 8), ...keywords],
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url,
      siteName: site.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${site.name}`,
      description,
    },
  };
}
