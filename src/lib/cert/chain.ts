import { extractPemBlocks } from "@/lib/cert/convert";

type Forge = typeof import("node-forge");
type Certificate = import("node-forge").pki.Certificate;

async function loadForge(): Promise<Forge> {
  const imported = await import("node-forge");
  const mod = imported as unknown as { default?: Forge } & Forge;
  return (mod.default ?? mod) as Forge;
}

function nameOf(cert: Certificate) {
  return cert.subject.attributes.map((attr) => `${attr.shortName || attr.name}=${attr.value}`).join(", ");
}

function issuerOf(cert: Certificate) {
  return cert.issuer.attributes.map((attr) => `${attr.shortName || attr.name}=${attr.value}`).join(", ");
}

export interface ChainCheck {
  ok: boolean;
  summary: string;
  certs: {
    subject: string;
    issuer: string;
    notAfter: string;
    selfSigned: boolean;
    expired: boolean;
  }[];
  issues: string[];
}

export async function validateCertificateChain(pemBundle: string): Promise<ChainCheck> {
  const forge = await loadForge();
  const blocks = extractPemBlocks(pemBundle).filter((block) => block.includes("BEGIN CERTIFICATE"));
  if (!blocks.length) throw new Error("Paste one or more PEM certificates.");

  const certs = blocks.map((block) => forge.pki.certificateFromPem(block));
  const issues: string[] = [];
  const now = new Date();

  const rows = certs.map((cert) => {
    const selfSigned = nameOf(cert) === issuerOf(cert);
    const expired = cert.validity.notAfter < now;
    if (expired) issues.push(`${nameOf(cert)} expired on ${cert.validity.notAfter.toISOString()}.`);
    if (cert.validity.notBefore > now) issues.push(`${nameOf(cert)} is not valid yet.`);
    return {
      subject: nameOf(cert),
      issuer: issuerOf(cert),
      notAfter: cert.validity.notAfter.toISOString(),
      selfSigned,
      expired,
    };
  });

  for (let i = 0; i < certs.length - 1; i += 1) {
    const child = certs[i];
    const parent = certs[i + 1];
    if (issuerOf(child) !== nameOf(parent)) {
      issues.push(`Missing or unordered issuer after ${nameOf(child)}. Expected ${issuerOf(child)}.`);
      continue;
    }
    try {
      if (!child.verify(parent)) issues.push(`Signature from ${nameOf(parent)} did not verify ${nameOf(child)}.`);
    } catch {
      issues.push(`Could not verify ${nameOf(child)} against ${nameOf(parent)}.`);
    }
  }

  const leaf = rows[0];
  if (certs.length === 1 && leaf.selfSigned) {
    issues.push("This is a self-signed leaf. Browsers will warn until you trust it or a Root CA that issued it.");
  }
  if (certs.length > 1 && !rows.at(-1)?.selfSigned) {
    issues.push("The last certificate is not a self-signed root. The trust path may still be missing a root.");
  }

  return {
    ok: issues.length === 0,
    summary: issues.length
      ? `${issues.length} issue${issues.length === 1 ? "" : "s"} in this chain.`
      : `Chain of ${certs.length} certificate${certs.length === 1 ? "" : "s"} verifies in order.`,
    certs: rows,
    issues,
  };
}
