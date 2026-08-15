import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "SSL & certificate guides",
  description:
    "How to create a self-signed SSL certificate for localhost, generate a CSR online, and run a local certificate authority — without uploading private keys.",
  path: "/guides",
});

const guides = [
  {
    href: "/guides/self-signed-ssl-localhost",
    title: "Self-signed SSL for localhost HTTPS",
    body: "Why browsers warn, how SANs work, and how to generate a localhost certificate.",
  },
  {
    href: "/guides/generate-csr-online",
    title: "Generate a CSR without sending the key",
    body: "What a certificate signing request is, and how to create one in the browser.",
  },
  {
    href: "/guides/local-certificate-authority",
    title: "Make a local CA and sign host certs",
    body: "Trust one Root CA, then issue host certificates for every internal service.",
  },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="eyebrow">Guides</p>
      <h1 className="display mt-3 text-5xl">How to generate SSL certificates locally.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        Short answers to the searches that usually end in an OpenSSL man page.
      </p>
      <div className="mt-10 space-y-4">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="block rounded-[28px] border border-line bg-surface p-6 hover:border-line-strong"
          >
            <h2 className="font-serif text-2xl tracking-tight">{guide.title}</h2>
            <p className="mt-2 text-sm text-muted">{guide.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
