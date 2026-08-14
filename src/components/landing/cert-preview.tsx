export function CertPreview() {
  return (
    <div className="animate-rise relative mx-auto w-full max-w-md" style={{ animationDelay: "180ms" }}>
      <div className="absolute -right-6 -top-6 hidden h-28 w-28 animate-seal sm:block">
        <WaxSeal />
      </div>
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-muted">
          <span>Self-signed TLS</span>
          <span className="text-sage">This tab only</span>
        </div>
        <div className="space-y-5 px-6 py-6">
          <div>
            <p className="eyebrow">Subject</p>
            <p className="mt-2 font-serif text-3xl tracking-tight">localhost</p>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">Algorithm</dt>
              <dd className="mt-1 font-medium">RSA 2048</dd>
            </div>
            <div>
              <dt className="text-muted">Valid</dt>
              <dd className="mt-1 font-medium">365 days</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted">SHA-256 fingerprint</dt>
              <dd className="mt-1 truncate font-mono text-[12px] text-ink-soft">
                A4:F1:C8:E2:9B:0D:77:E1:C6:A9:B3:D4
              </dd>
            </div>
          </dl>
          <div className="rounded-2xl border border-dashed border-line-strong bg-bg-muted/70 p-4">
            <p className="text-xs font-medium text-wax">Private key is in memory</p>
            <p className="mt-1 text-sm text-muted">
              Download now. Refresh the page and it is gone forever — by design.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-ink px-3 py-1.5 text-xs text-bg">.crt</span>
            <span className="rounded-full border border-line px-3 py-1.5 text-xs">.key</span>
            <span className="rounded-full border border-line px-3 py-1.5 text-xs">.pem</span>
            <span className="rounded-full border border-line px-3 py-1.5 text-xs">.pfx</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaxSeal() {
  return (
    <svg viewBox="0 0 112 112" className="h-full w-full drop-shadow-xl">
      <circle cx="56" cy="56" r="48" className="fill-wax" />
      <circle
        cx="56"
        cy="56"
        r="38"
        className="fill-none stroke-white/55"
        strokeWidth="1.2"
      />
      <text
        x="56"
        y="62"
        textAnchor="middle"
        className="fill-white"
        style={{ fontFamily: "Georgia, serif", fontSize: "28px" }}
      >
        S
      </text>
    </svg>
  );
}
