const faqs = [
  {
    q: "Do you store my certificate or private key?",
    a: "No. Generation happens in your browser. Signet’s servers never receive certificates, private keys, CSRs, or PFX files. If you sign in, we can keep a local metadata history on this device — names, dates, fingerprints — not the secrets.",
  },
  {
    q: "How many certificates can I generate?",
    a: "Free includes 3 certificates. Studio includes 25. The count is stored on this device and is not reset by deleting history. Private keys are still never uploaded. Upgrade from the generator or settings when you hit the cap.",
  },
  {
    q: "Can I use this without an account?",
    a: "Yes. Guest mode is first-class. An account is only for remembering metadata and settings on this device.",
  },
  {
    q: "Which certificate type should I generate?",
    a: "For several internal hosts, forge a Root CA, trust it once, then issue a host certificate per server. Self-signed TLS is the one-off shortcut when you have a single box and no CA. A client certificate is for mTLS — proving who is calling. A CSR is not a certificate yet: send it to a public or company CA for a site on the internet.",
  },
  {
    q: "What is the difference between a Root CA and a host certificate?",
    a: "The Root CA is the authority. You install its public certificate in a trust store. The host certificate is the leaf you put on a server; it is signed by that CA. Trust the CA, not every host cert. Keep the CA private key offline — it can sign anything.",
  },
  {
    q: "Are self-signed certificates trusted by browsers?",
    a: "Not automatically. Browsers will warn until you trust the certificate locally. That is expected. Signet is for lab, staging, internal services, and CSRs you send to a real CA.",
  },
  {
    q: "What happens if I refresh after generating?",
    a: "The private key is gone. That is the product. Download before you leave the success screen.",
  },
  {
    q: "Is this a certificate authority?",
    a: "No. Signet does not operate a public CA and does not issue publicly trusted certificates. It helps you create keys and certificates on your own machine.",
  },
];

export function Faq() {
  return (
    <section className="border-t border-line py-20">
      <div className="mx-auto max-w-3xl px-5">
        <p className="eyebrow">Questions</p>
        <h2 className="display mt-3 text-4xl">Straight answers.</h2>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="cursor-pointer list-none font-medium marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-muted transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
