import type { Metadata } from "next";
import { CalendarClock, KeyRound, Shield } from "lucide-react";
import { CalendlyEmbed } from "@/components/consult/calendly-embed";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Book a cybersecurity call",
  description:
    "Book 30 minutes with Prakash to talk through TLS, internal PKI, localhost HTTPS, and certificate errors. Leave private keys on your machine.",
  path: "/consult",
});

const points = [
  { icon: Shield, title: "What we can cover", body: "Self-signed certs, a local Root CA, SANs, HSTS, and why Chrome is warning." },
  { icon: KeyRound, title: "What stays with you", body: "Do not paste a private key into the calendar notes. The generator never uploads one either." },
  { icon: CalendarClock, title: "How long", body: "Thirty minutes. Pick a time on the calendar. You will get the usual Calendly confirmation." },
];

export default function ConsultPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.78fr_1.22fr]">
      <div>
        <p className="eyebrow">Cybersecurity</p>
        <h1 className="display mt-3 text-5xl">Book 30 minutes.</h1>
        <p className="mt-4 text-lg text-ink-soft">
          A direct calendar for certificate design, internal HTTPS, and the errors that show up when a lab cert meets a browser.
        </p>
        <ul className="mt-8 space-y-4">
          {points.map((point) => (
            <li key={point.title} className="rounded-3xl border border-line bg-surface p-5">
              <point.icon className="h-4 w-4 text-wax" />
              <p className="mt-3 font-medium">{point.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
      <CalendlyEmbed />
    </div>
  );
}
