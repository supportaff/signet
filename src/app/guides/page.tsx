import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "SSL & certificate guides",
  description:
    "How to create a self-signed SSL certificate for localhost, fix Chrome certificate errors, trust a local CA on Windows, macOS, and Linux, and generate a CSR without uploading the key.",
  path: "/guides",
});

const guides = GUIDES;

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
