import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Free SSL tools — decode certificates, CSRs, OpenSSL commands",
  description:
    "Free browser SSL tools: decode a PEM certificate, inspect a CSR, and copy OpenSSL commands. Nothing is uploaded.",
  path: "/tools",
  keywords: ["free SSL tools", "certificate decoder", "CSR decoder"],
});

const tools = [
  {
    href: "/tools/decode-certificate",
    title: "SSL certificate decoder",
    body: "Read subject, issuer, SANs, dates, and fingerprints from a .crt PEM.",
  },
  {
    href: "/tools/decode-csr",
    title: "CSR decoder",
    body: "Check a certificate signing request before you send it to a CA.",
  },
  {
    href: "/tools/openssl",
    title: "OpenSSL command cheat sheet",
    body: "Copy openssl req / x509 / pkcs12 commands for localhost and CSRs.",
  },
  {
    href: "/generate",
    title: "Certificate generator",
    body: "Create self-signed SSL, Root CA, host, mTLS, or CSR files in the browser.",
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <p className="eyebrow">Free tools</p>
      <h1 className="display mt-3 text-5xl">SSL tools that never take your key.</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        Decode certificates and CSRs locally, or generate a new self-signed SSL
        certificate for localhost. These pages are built for searchers who
        would rather not paste a private key into a random website.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-[28px] border border-line bg-surface p-6 transition hover:border-line-strong"
          >
            <h2 className="font-serif text-2xl tracking-tight">{tool.title}</h2>
            <p className="mt-2 text-sm text-muted">{tool.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
