const steps = [
  {
    n: "01",
    title: "Describe the identity",
    body: "Common name, SANs, organization, validity, and key size. Smart defaults get you a usable localhost certificate in seconds.",
  },
  {
    n: "02",
    title: "Forge it here",
    body: "Your browser generates the keypair and signs the certificate. Nothing is posted to Signet. There is no issuance API.",
  },
  {
    n: "03",
    title: "Take the files. Leave nothing.",
    body: "Download or copy. We can remember a fingerprint if you want a paper trail — never the key. Refresh, and memory is empty.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line bg-bg-muted py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">How it works</p>
        <h2 className="display mt-3 max-w-xl text-4xl sm:text-5xl">
          Three steps. Zero uploads.
        </h2>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {steps.map((step) => (
            <article key={step.n} className="rounded-3xl border border-line bg-surface p-6">
              <p className="font-serif text-4xl text-wax/80">{step.n}</p>
              <h3 className="mt-5 text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
