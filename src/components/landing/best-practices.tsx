const practices = [
  {
    title: "Download before you leave",
    body: "The private key exists only in this tab. Refresh, close, or crash and it is gone. Save the files first, then verify them.",
  },
  {
    title: "Never send the private key",
    body: "Do not email, Slack, or commit a .key or an unlocked .pfx. A CSR is what you send to a CA. The key stays with you.",
  },
  {
    title: "Name it the way you will connect",
    body: "Browsers and TLS clients check SANs, not just the common name. If you will open https://api.dev.local, that name must be on the certificate.",
  },
  {
    title: "Trust the CA, not every host",
    body: "Install the Root CA in the OS or browser store once. Put host certificates on servers only. Never install a host cert as a trusted root, and never put the CA private key on the web server.",
  },
  {
    title: "Let the CA outlive the hosts",
    body: "A lab CA can last five to ten years. Host certs should be much shorter. If a host would expire after the CA, SelfSignedCert will refuse to issue it.",
  },
  {
    title: "Keep lab certs short-lived",
    body: "90 days is plenty for localhost and staging. Long-lived keys get copied, forgotten, and reused. Prefer re-issuing over a ten-year cert.",
  },
  {
    title: "One identity per service",
    body: "Do not reuse a single key across prod, staging, and a laptop. Compromise of one environment should not impersonate the others.",
  },
  {
    title: "Password the PFX",
    body: "If you need PKCS#12 for Windows or a phone, set a password you will remember. An unlocked .pfx is a private key in a different costume.",
  },
  {
    title: "2048 is the default on purpose",
    body: "RSA 2048 is the right size for internal TLS. Use 4096 only when a policy demands it — it is slower to generate and rarely buys you anything here.",
  },
  {
    title: "Self-signed is not public trust",
    body: "A self-signed cert will warn in every browser until you trust it locally. For a public site, generate a CSR and let a real CA sign it.",
  },
  {
    title: "Park the key after download",
    body: "Move the private key into the OS store, a secrets manager, or the server config — then delete the download from your desktop.",
  },
];

export function BestPractices() {
  return (
    <section id="best-practices" className="border-t border-line bg-bg-muted py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">Best practices</p>
        <h2 className="display mt-3 max-w-2xl text-4xl sm:text-5xl">
          How to handle what you just forged.
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          SelfSignedCert can mint the files. It cannot keep you from leaking them afterwards.
          These are the habits that actually matter.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {practices.map((item, index) => (
            <article key={item.title} className="rounded-3xl border border-line bg-surface p-6">
              <p className="font-serif text-2xl text-wax/80">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
