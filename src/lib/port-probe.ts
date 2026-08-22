import net from "node:net";
import { resolvePublicHost, SslCheckError } from "@/lib/ssl-check";

export const WEB_PORTS = [
  { port: 80, label: "HTTP" },
  { port: 443, label: "HTTPS" },
  { port: 8080, label: "HTTP-alt" },
  { port: 8443, label: "HTTPS-alt" },
] as const;

function probePort(ip: string, port: number, timeoutMs = 1800) {
  return new Promise<{ port: number; open: boolean }>((resolve) => {
    const socket = net.connect({ host: ip, port });
    const finish = (open: boolean) => {
      socket.destroy();
      resolve({ port, open });
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      finish(true);
    });
    socket.once("error", () => {
      clearTimeout(timer);
      finish(false);
    });
  });
}

export async function probeWebPorts(input: string) {
  const hostname = input.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0]?.split(":")[0] || "";
  if (!hostname) throw new SslCheckError(400, "Enter a public hostname.");
  const resolved = await resolvePublicHost(hostname);
  const results = await Promise.all(WEB_PORTS.map((item) => probePort(resolved.ip, item.port)));
  return {
    hostname: resolved.hostname,
    ip: resolved.ip,
    ports: WEB_PORTS.map((item) => ({
      ...item,
      open: results.find((row) => row.port === item.port)?.open ?? false,
    })),
    nmap: `nmap -Pn -p 80,443,8080,8443 ${resolved.hostname}`,
  };
}
