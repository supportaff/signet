import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "OpenSSL self-signed certificate commands for localhost",
  description:
    "Copy OpenSSL commands to create a self-signed SSL certificate, CSR, or PFX for localhost — or skip the CLI and generate the same files in Signet.",
  path: "/tools/openssl",
  keywords: ["openssl self signed certificate", "openssl req localhost", "openssl csr"],
});

const blocks = [
  {
    title: "Self-signed cert for localhost",
    cmd: `openssl req -x509 -newkey rsa:2048 -sha256 -days 365 -nodes \\
  -keyout localhost.key -out localhost.crt \\
  -subj "/CN=localhost" \\
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`,
  },
  {
    title: "CSR only (keep the key)",
    cmd: `openssl req -new -newkey rsa:2048 -nodes \\
  -keyout example.key -out example.csr \\
  -subj "/CN=example.com"`,
  },
  {
    title: "PFX / PKCS#12 from cert + key",
    cmd: `openssl pkcs12 -export -inkey localhost.key -in localhost.crt -out localhost.pfx`,
  },
];

export default function OpensslPage() {
  return (
    <article className="prose-legal mx-auto max-w-3xl px-5 py-16">
      <p className="eyebrow">Free tool</p>
      <h1 className="display mt-3 text-5xl">OpenSSL commands, or skip them.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        People search for “openssl req -x509 localhost” every day. Here are the
        commands. If you would rather not install OpenSSL,{" "}
        <Link href="/generate" className="text-wax hover:underline">
          generate the same self-signed SSL certificate in the browser
        </Link>
        .
      </p>
      {blocks.map((block) => (
        <section key={block.title} className="mt-10">
          <h2>{block.title}</h2>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-bg-muted p-4 font-mono text-[12px] leading-6">
            {block.cmd}
          </pre>
        </section>
      ))}
      <h2>When the CLI is the wrong tool</h2>
      <p>
        OpenSSL is correct and scriptable. It is also easy to omit SANs, which
        makes browsers reject localhost HTTPS. Signet fills SANs by default
        and never sends the private key off the device.
      </p>
    </article>
  );
}
