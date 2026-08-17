import type { ReactNode } from "react";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { TOOLS } from "@/lib/catalog";
import { breadcrumbJsonLd } from "@/lib/seo";

export function ToolPage({
  path,
  title,
  lede,
  children,
}: {
  path: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  const related = TOOLS.filter((tool) => tool.href !== path).slice(0, 4);
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: title, path },
        ])}
      />
      <p className="text-xs text-muted">
        <Link href="/tools" className="hover:text-ink">
          Tools
        </Link>{" "}
        / {title}
      </p>
      <p className="eyebrow mt-6">Free tool</p>
      <h1 className="display mt-3 text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-ink-soft">{lede}</p>
      <div className="mt-8">{children}</div>
      <div className="mt-10 border-t border-line pt-6 text-sm">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Also</p>
        <ul className="mt-3 space-y-2">
          {related.map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} className="text-wax hover:underline">
                {tool.title}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/generate" className="text-wax hover:underline">
              Certificate generator
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
