"use client";

import { useState } from "react";
import Link from "next/link";
import { WORKS_WITH } from "@/lib/catalog";

export function WorksWith() {
  const [index, setIndex] = useState(0);
  const slide = WORKS_WITH[index];

  return (
    <section id="works-with" className="border-t border-line py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">Works with</p>
        <h2 className="display mt-3 max-w-3xl text-4xl sm:text-5xl">
          The boxes that keep asking for a certificate.
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Self-hosted and on-prem products rarely get a public CA. Mint a Root CA
          once, then issue a host cert that matches the name you type. Text badges
          only — no vendor marks.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {WORKS_WITH.map((item, i) => (
            <button
              key={item.category}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                i === index
                  ? "border-ink bg-ink text-bg"
                  : "border-line bg-surface text-ink-soft hover:border-line-strong"
              }`}
            >
              {item.category}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-line bg-surface p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">{slide.category}</p>
          <h3 className="mt-3 font-serif text-3xl tracking-tight">{slide.headline}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">{slide.line}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {slide.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-line bg-bg-muted px-3 py-1 text-xs text-ink-soft"
              >
                {badge}
              </span>
            ))}
          </div>
          <Link href="/generate" className="mt-6 inline-block text-sm font-medium text-wax hover:underline">
            Generate a host certificate
          </Link>
        </div>
      </div>
    </section>
  );
}
