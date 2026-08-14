import Link from "next/link";

const items = [
  {
    title: "Root CA",
    line: "Your private authority. Trust it once, then issue host certs from it.",
  },
  {
    title: "Host certificate",
    line: "A server cert signed by that CA. Put it on nginx, Caddy, or the host.",
  },
  {
    title: "Self-signed TLS",
    line: "One-off HTTPS when you do not want to run a CA.",
  },
  {
    title: "Client certificate",
    line: "Prove who is calling. mTLS for APIs, bots, and devices.",
  },
  {
    title: "CSR",
    line: "Ask a public or company CA to sign a public site. Keep the .key.",
  },
];

export function TypeGuide() {
  return (
    <div className="mb-8 rounded-[28px] border border-line bg-bg-muted/70 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium">Which type should I pick?</p>
          <p className="mt-1 text-sm text-muted">
            A certificate binds a public key to a name. The type is about who presents it.
          </p>
        </div>
        <Link href="/#certificates" className="text-sm text-wax hover:underline">
          Full guide
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-line bg-surface px-4 py-3">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{item.line}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
