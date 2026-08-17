import type { ReactNode } from "react";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { GUIDES } from "@/lib/catalog";
import { breadcrumbJsonLd, howtoJsonLd } from "@/lib/seo";

export function GuideArticle({
  path,
  kicker = "Guide",
  title,
  lede,
  steps,
  children,
}: {
  path: string;
  kicker?: string;
  title: string;
  lede: string;
  steps: { name: string; text: string }[];
  children: ReactNode;
}) {
  const related = GUIDES.filter((guide) => guide.href !== path).slice(0, 4);
  return (
    <article className="prose-legal mx-auto max-w-2xl px-5 py-16">
      <JsonLd
        data={[
          howtoJsonLd({ name: title, description: lede, path, steps }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: title, path },
          ]),
        ]}
      />
      <p className="text-xs text-muted">
        <Link href="/guides" className="hover:text-ink">
          Guides
        </Link>{" "}
        / {title}
      </p>
      <p className="eyebrow mt-6">{kicker}</p>
      <h1 className="display mt-3 text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-ink-soft">{lede}</p>
      {children}
      <p className="mt-10 text-sm text-muted">
        Written for operators who have to trust the box they just stood up. Private keys stay in the
        tab.{" "}
        <Link href="/generate" className="text-wax hover:underline">
          Open the generator
        </Link>
        .
      </p>
      <div className="mt-10 border-t border-line pt-6">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Related</p>
        <ul className="mt-3 space-y-2 text-sm">
          {related.map((guide) => (
            <li key={guide.href}>
              <Link href={guide.href} className="text-wax hover:underline">
                {guide.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
