import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { buttonVariants } from "@/components/ui/button";
import { PLAN_CATALOG } from "@/lib/plans";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "Pricing — free SSL generator, Plus $5, Studio $12",
  description:
    "Free plan: 3 certificates. Plus $5/month for 25. Studio $12/month for 50. Generate self-signed SSL, CSRs, and mTLS certs in the browser.",
  path: "/pricing",
});

const plans = PLAN_CATALOG.map((plan) => ({
  ...plan,
  featured: plan.id === "plus",
}));

const rows: { label: string; values: (string | boolean)[] }[] = [
  { label: "Certificates you can generate", values: ["3", "25", "50"] },
  { label: "Root CA certificates", values: [true, true, true] },
  { label: "Host certificates (CA-signed)", values: [true, true, true] },
  { label: "Self-signed TLS", values: [true, true, true] },
  { label: "Client certificates (mTLS)", values: [true, true, true] },
  { label: "CSR generation", values: [true, true, true] },
  { label: "RSA 2048", values: [true, true, true] },
  { label: "RSA 4096", values: [true, true, true] },
  { label: ".crt / .key / .pem / .pfx / zip", values: [true, true, true] },
  { label: "Guest mode", values: [true, true, true] },
  { label: "Saved subject profiles", values: [false, true, true] },
  { label: "Priority support", values: [false, false, true] },
  { label: "Private keys stored by SelfSignedCert", values: ["Never", "Never", "Never"] },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <p className="eyebrow">Pricing</p>
      <h1 className="display mt-3 max-w-3xl text-5xl">
        Three plans. None of them ever hold your keys.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        Generation is always local. Free includes 3 certificates, Plus includes 25,
        Studio includes 50. You pay for a higher cap — never for custody of a
        secret we should not see.
      </p>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              "flex flex-col rounded-[28px] border p-6",
              plan.featured ? "border-wax/40 bg-surface shadow-lift" : "border-line bg-surface",
            )}
          >
            <p className="text-sm text-muted">{plan.name}</p>
            <p className="mt-3 font-serif text-5xl">
              {plan.price}
              <span className="ml-2 text-sm text-muted">{plan.cadence}</span>
            </p>
            <p className="mt-4 font-serif text-2xl tracking-tight">{plan.highlight}</p>
            <p className="mt-2 flex-1 text-sm text-ink-soft">{plan.blurb}</p>
            {plan.id === "free" ? (
              <Link
                href="/generate"
                className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
              >
                Generate now
              </Link>
            ) : (
              <UpgradeButton
                plan={plan.id}
                label={`Subscribe to ${plan.name}`}
                featured={plan.featured}
              />
            )}
          </article>
        ))}
      </div>

      <div className="mt-14 overflow-hidden rounded-[28px] border border-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-bg-muted">
              <tr>
                <th className="px-5 py-4 font-medium">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.name} className="px-5 py-4 font-medium">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-line">
                  <td className="px-5 py-3.5 text-muted">{row.label}</td>
                  {row.values.map((value, i) => (
                    <td key={`${row.label}-${i}`} className="px-5 py-3.5">
                      {value === true ? (
                        <Check className="h-4 w-4 text-sage" />
                      ) : value === false ? (
                        <Minus className="h-4 w-4 text-line-strong" />
                      ) : (
                        <span className={value === "Never" ? "font-medium text-wax" : ""}>{value}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
