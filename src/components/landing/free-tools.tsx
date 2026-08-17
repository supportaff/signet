import Link from "next/link";
import { FileSearch, FileText, Globe, Terminal } from "lucide-react";

const tools = [
  {
    href: "/tools/check-ssl",
    icon: Globe,
    title: "Live SSL checker",
    body: "Enter a URL and read the public certificate: issuer, expiry, SANs, and whether the hostname matches.",
  },
  {
    href: "/tools/convert",
    icon: FileSearch,
    title: "PEM / DER / PFX converter",
    body: "Convert encodings and pack a PFX in this tab. The password and key never upload.",
  },
  {
    href: "/tools/security-headers",
    icon: FileText,
    title: "HSTS & headers checker",
    body: "See whether a public site sends HSTS, CSP, and clickjacking headers.",
  },
  {
    href: "/tools/ssh-keygen",
    icon: Terminal,
    title: "SSH key generator",
    body: "Mint an RSA or ECDSA key pair with Web Crypto. Copy the OpenSSH public key.",
  },
];

export function FreeTools() {
  return (
    <section id="tools" className="border-t border-line bg-bg-muted py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">Free tools</p>
        <h2 className="display mt-3 max-w-2xl text-4xl sm:text-5xl">
          Decode certs and CSRs. No signup.
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          These pages exist so you can check a certificate without pasting a
          private key into a stranger&apos;s form. Same privacy rule as the generator.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-3xl border border-line bg-surface p-6 transition hover:-translate-y-0.5 hover:border-line-strong"
            >
              <tool.icon className="h-5 w-5 text-wax" />
              <h3 className="mt-4 font-medium">{tool.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{tool.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
