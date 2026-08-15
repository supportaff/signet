import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PLAN_CATALOG } from "@/lib/plans";
import { cn } from "@/lib/utils";

const extras: Record<string, string[]> = {
  free: ["Root CA, host, self-signed, client, CSR", "RSA 2048 & 4096", "Downloads in every format"],
  plus: ["Everything in Free", "Saved subject profiles", "Passworded PFX helpers"],
  studio: ["Everything in Plus", "Priority email", "Highest local cap"],
};

export function PricingPreview() {
  return (
    <section className="border-t border-line bg-bg-muted py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">Pricing</p>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="display max-w-xl text-4xl sm:text-5xl">
            Pay for a higher cap. Never for custody of your keys.
          </h2>
          <Link href="/pricing" className="text-sm text-ink-soft underline-offset-4 hover:underline">
            Full comparison
          </Link>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {PLAN_CATALOG.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "rounded-3xl border p-7",
                plan.id === "plus" ? "border-wax/40 bg-surface shadow-lift" : "border-line bg-surface",
              )}
            >
              <p className="text-sm text-muted">{plan.name}</p>
              <p className="mt-2 font-serif text-5xl">
                {plan.price}
                <span className="ml-1 text-base text-muted">{plan.price === "$0" ? "" : "/ mo"}</span>
              </p>
              <p className="mt-3 text-sm text-ink-soft">{plan.blurb}</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-sage" />
                  {plan.highlight}
                </li>
                {extras[plan.id].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-sage" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.id === "free" ? "/generate" : "/pricing"}
                className={cn(
                  buttonVariants({ variant: plan.id === "plus" ? "wax" : "outline" }),
                  "mt-8 w-full",
                )}
              >
                {plan.id === "free" ? "Start generating" : `See ${plan.name}`}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
