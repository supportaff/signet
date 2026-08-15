import Link from "next/link";
import { ArrowRight, Building2, FileSignature, MonitorSmartphone, Server, Smartphone } from "lucide-react";

const pki = [
  {
    icon: Building2,
    kicker: "Step 1 · Authority",
    title: "Root CA certificate",
    what: "A certificate authority you own. It does not sit on a website. You install it in a trust store once. After that, any host certificate it signs is trusted by machines that trust this CA.",
    when: [
      "You run several internal hosts and do not want to trust each one by hand",
      "A homelab, staging cluster, or company lab",
      "You want one trust decision, then many host certs",
    ],
    where: [
      "macOS Keychain, Windows Trusted Root, Linux ca-certificates",
      "Browser or OS trust stores on developer machines",
      "A secrets vault — the CA private key never belongs on a web server",
    ],
    avoid:
      "Do not put the CA private key on nginx, a laptop desktop, or git. Anyone with that key can impersonate every host you issue.",
    files: "ca.crt to trust, ca.key to keep offline",
  },
  {
    icon: MonitorSmartphone,
    kicker: "Step 2 · Server",
    title: "Host certificate",
    what: "A leaf certificate for one hostname or service, signed by your Root CA. The issuer is the CA, not the host. Browsers that trust the CA will accept this host without a warning.",
    when: [
      "api.dev.local, *.apps.internal, a NAS, or a k8s ingress",
      "You already have a Root CA (forged here or elsewhere)",
      "You will rotate this cert more often than the CA",
    ],
    where: [
      "nginx, Caddy, Traefik, IIS, Apache",
      "Node, Go, Java, .NET HTTPS servers",
      "Docker Compose and Kubernetes ingress",
    ],
    avoid:
      "A host cert is not a CA. Do not install it in the Trusted Root store. Install the CA there, and this file on the server.",
    files: "host.crt + host.key, plus the CA or a chain.pem",
  },
];

const others = [
  {
    icon: Server,
    kicker: "One-off server",
    title: "Self-signed TLS",
    what: "A server certificate that signed itself. Fast when you have a single box and no desire to run a CA.",
    when: ["A single localhost or one internal service", "You will trust this one cert by hand"],
    avoid: "Poor fit once you have many hosts — you will click through warnings forever. Use a Root CA + host certs instead.",
    files: ".crt + .key",
  },
  {
    icon: Smartphone,
    kicker: "Caller identity",
    title: "Client certificate",
    what: "Proves who is calling an API or gateway (mTLS). Not a website certificate.",
    when: ["API gateways, bots, devices, admin tools"],
    avoid: "Installing this on a server will not give visitors HTTPS.",
    files: ".pfx or .crt + .key",
  },
  {
    icon: FileSignature,
    kicker: "Request",
    title: "CSR",
    what: "A request you send to a public or company CA. Not a certificate until they sign it.",
    when: ["A public site that must show a lock with no warning"],
    avoid: "Never send the private key with the CSR. The .csr is enough.",
    files: ".csr to the CA, .key stays with you",
  },
];

const chooser = [
  {
    situation: "Several internal hosts, trust them all once",
    pick: "Root CA, then a host cert per server",
  },
  {
    situation: "One hostname on nginx / Caddy / k8s",
    pick: "Host certificate (signed by your CA)",
  },
  {
    situation: "A single localhost and no CA to manage",
    pick: "Self-signed TLS",
  },
  {
    situation: "A public site on the internet",
    pick: "CSR → send to a public CA",
  },
  {
    situation: "An API that should only accept known callers",
    pick: "Client certificate",
  },
  {
    situation: "Your company PKI / IT team issues the certs",
    pick: "CSR",
  },
];

export function CertGuide() {
  return (
    <section id="certificates" className="border-t border-line py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">Certificate guide</p>
        <h2 className="display mt-3 max-w-3xl text-4xl sm:text-5xl">
          Root CA and host certs, plus the rest.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
          A certificate binds a public key to a name. In a private PKI you forge a
          Root CA once, trust it on your machines, then issue a host certificate
          for each server. SelfSignedCert does that pairing in this browser. Nothing is uploaded.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { n: "01", t: "Forge a Root CA", d: "Long-lived. Keep the CA key offline." },
            { n: "02", t: "Trust the CA once", d: "Install ca.crt in the OS or browser store." },
            { n: "03", t: "Issue host certs", d: "Each server gets a leaf signed by that CA." },
          ].map((step) => (
            <div key={step.n} className="rounded-3xl border border-line bg-surface px-5 py-4">
              <p className="font-serif text-2xl text-wax/80">{step.n}</p>
              <p className="mt-2 font-medium">{step.t}</p>
              <p className="mt-1 text-sm text-muted">{step.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {pki.map((item) => (
            <GuideCard key={item.title} item={item} />
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {others.map((item) => (
            <GuideCard key={item.title} item={item} compact />
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-line">
          <div className="border-b border-line bg-bg-muted px-5 py-4">
            <h3 className="font-medium">If you are not sure, start here</h3>
            <p className="mt-1 text-sm text-muted">
              Pick the situation that is closest. Then generate that type.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Situation</th>
                  <th className="px-5 py-3 font-medium">Forge this</th>
                </tr>
              </thead>
              <tbody>
                {chooser.map((row) => (
                  <tr key={row.situation} className="border-t border-line">
                    <td className="px-5 py-3.5 text-ink-soft">{row.situation}</td>
                    <td className="px-5 py-3.5 font-medium">{row.pick}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Link
          href="/generate"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-wax hover:underline"
        >
          Open the generator
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function GuideCard({
  item,
  compact = false,
}: {
  item: {
    icon: typeof Server;
    kicker: string;
    title: string;
    what: string;
    when: string[];
    where?: string[];
    avoid: string;
    files: string;
  };
  compact?: boolean;
}) {
  return (
    <article className="flex flex-col rounded-[28px] border border-line bg-surface p-6">
      <item.icon className="h-5 w-5 text-wax" />
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {item.kicker}
      </p>
      <h3 className="mt-2 font-serif text-2xl tracking-tight">{item.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.what}</p>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Use when</p>
      <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
        {item.when.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sage" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {item.where && !compact ? (
        <>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Use where</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
            {item.where.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <p className="mt-5 text-xs text-muted">You download {item.files}</p>
      <p className="mt-auto border-t border-line pt-4 text-sm leading-relaxed text-muted">{item.avoid}</p>
    </article>
  );
}
