import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/generate", label: "SSL certificate generator" },
      { href: "/pricing", label: "Pricing" },
      { href: "/#certificates", label: "Certificate types" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Free tools",
    links: [
      { href: "/tools", label: "All tools" },
      { href: "/tools/check-ssl", label: "Check site certificate" },
      { href: "/tools/decode-certificate", label: "Decode SSL certificate" },
      { href: "/tools/decode-csr", label: "Decode CSR" },
      { href: "/tools/openssl", label: "OpenSSL commands" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: "/guides", label: "All guides" },
      { href: "/guides/self-signed-ssl-localhost", label: "Localhost HTTPS" },
      { href: "/guides/generate-csr-online", label: "Generate a CSR" },
      { href: "/guides/local-certificate-authority", label: "Local CA" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            A private notary for TLS. Certificates and keys are created in this
            browser tab. SelfSignedCert has nothing to leak because it never holds them.
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            Contact{" "}
            <a className="text-wax hover:underline" href={`mailto:${site.supportEmail}`}>
              {site.supportEmail}
            </a>
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="eyebrow">{column.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SelfSignedCert. Keys stay on the device.</p>
          <p>No certificates. No private keys. No exceptions.</p>
        </div>
      </div>
    </footer>
  );
}
