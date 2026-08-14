import { FileKey2, Fingerprint, FolderLock, KeyRound, Laptop, ScanEye } from "lucide-react";

const features = [
  {
    icon: Laptop,
    title: "Generated in the browser",
    body: "RSA keypairs, X.509 certificates, CSRs, and PKCS#12 files are assembled on-device. Close the tab and the secrets disappear.",
  },
  {
    icon: FolderLock,
    title: "We store nothing sensitive",
    body: "No certificates, no private keys, no CSRs on our servers. Logged-in history is metadata only — names, dates, fingerprints.",
  },
  {
    icon: KeyRound,
    title: "Private PKI, mTLS, and CSRs",
    body: "Forge a Root CA, issue host certificates from it, or mint a one-off self-signed leaf, a client cert, or a CSR.",
  },
  {
    icon: Fingerprint,
    title: "Readable details",
    body: "Serial, subject, SANs, validity window, and SHA-1 / SHA-256 fingerprints — shown before you download anything.",
  },
  {
    icon: FileKey2,
    title: "The formats you actually need",
    body: "Download .crt, .key, .pem, .csr, or a password-protected .pfx. Copy any value, or take the whole bundle as a zip.",
  },
  {
    icon: ScanEye,
    title: "Built to be inspected",
    body: "No opaque backend in the issuance path. If you can read JavaScript, you can see exactly what runs on your machine.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-line py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">Why Signet</p>
        <h2 className="display mt-3 max-w-2xl text-4xl sm:text-5xl">
          A certificate tool that cannot betray you.
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Most “online certificate generators” ask you to trust a stranger with a private key.
          Signet is designed so that trust is unnecessary.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-line bg-surface p-6 transition hover:-translate-y-0.5 hover:border-line-strong"
            >
              <feature.icon className="h-5 w-5 text-wax" />
              <h3 className="mt-4 font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
