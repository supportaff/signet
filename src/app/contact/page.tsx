import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description: "Contact SelfSignedCert support. Never send a private key — we would refuse it.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <p className="eyebrow">Support</p>
      <h1 className="display mt-3 text-5xl">Talk to us.</h1>
      <p className="mt-4 text-ink-soft">
        For architecture reviews, press, or product questions. Do not paste a
        private key into this form — we would have to refuse it.
      </p>
      <ContactForm />
    </div>
  );
}
