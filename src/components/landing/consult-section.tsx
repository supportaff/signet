import Link from "next/link";
import { CalendarClock, KeyRound, Shield } from "lucide-react";
import { CalendlyEmbed } from "@/components/consult/calendly-embed";

const notes = [
  { icon: Shield, title: "TLS and internal PKI", body: "Root CAs, host names, and the trust store on the machines that matter." },
  { icon: KeyRound, title: "Bring the hostname", body: "Leave private keys on your machine. A name and a diagram are enough." },
  { icon: CalendarClock, title: "30 minutes", body: "A working session for lab HTTPS, certificate errors, and what to issue next." },
];

export function ConsultSection() {
  return (
    <section id="consult" className="border-t border-line py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div>
          <p className="eyebrow">Cybersecurity</p>
          <h2 className="display mt-3 text-4xl sm:text-5xl">Book a call about the certificate problem.</h2>
          <p className="mt-4 text-ink-soft">
            Prakash keeps a 30-minute slot for localhost HTTPS, private CAs, and the TLS mistakes that show up after the cert is minted.
          </p>
          <ul className="mt-8 space-y-4">
            {notes.map((note) => (
              <li key={note.title} className="flex gap-3 rounded-3xl border border-line bg-surface p-4">
                <note.icon className="mt-0.5 h-4 w-4 shrink-0 text-wax" />
                <div>
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="mt-1 text-sm text-muted">{note.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/consult" className="mt-6 inline-block text-sm text-wax hover:underline">
            Open the full booking page
          </Link>
        </div>
        <CalendlyEmbed height={720} />
      </div>
    </section>
  );
}
