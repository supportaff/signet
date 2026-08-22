import type { Metadata } from "next";
import { PortProbeTool } from "@/components/tools/recon-tools";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Nmap-style web port check + commands",
  description:
    "Probe HTTP/HTTPS ports on a public hostname you operate, and copy nmap commands to run a full scan on your own machine. We do not run nmap on our servers.",
  path: "/tools/nmap",
  keywords: ["nmap online", "check open ports HTTPS", "nmap commands"],
});

export default function NmapPage() {
  return (
    <ToolPage
      path="/tools/nmap"
      title="Web ports, not a full nmap."
      lede="We cannot run nmap on Vercel — no raw sockets, short timeouts, and it would turn this site into a scan service. What we do: a TCP check of 80, 443, 8080, and 8443 on a public host, with private IPs blocked. For a real nmap, copy the command and run it on a machine you control, only against hosts you are allowed to test."
    >
      <PortProbeTool />
      <div className="mt-8 space-y-3 text-sm text-ink-soft">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">More nmap locally</p>
        <pre className="overflow-x-auto rounded-2xl border border-line bg-surface p-4 text-[12px]">{`nmap -sV -p 80,443 example.com
nmap --script ssl-cert,ssl-enum-ciphers -p 443 example.com
nmap -Pn -p 80,443,8080,8443 example.com`}</pre>
      </div>
    </ToolPage>
  );
}
