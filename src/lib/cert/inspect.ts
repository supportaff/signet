type Forge = typeof import("node-forge");

async function loadForge(): Promise<Forge> {
  const imported = await import("node-forge");
  const mod = imported as unknown as { default?: Forge } & Forge;
  return (mod.default ?? mod) as Forge;
}

export interface InspectedField {
  label: string;
  value: string;
}

export async function inspectCertificatePem(pem: string): Promise<InspectedField[]> {
  const forge = await loadForge();
  const cert = forge.pki.certificateFromPem(pem);
  const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const sha256 = forge.md.sha256.create();
  sha256.update(der);
  const sha1 = forge.md.sha1.create();
  sha1.update(der);
  const sans =
    (cert.getExtension("subjectAltName") as { altNames?: { value?: string; ip?: string }[] } | undefined)
      ?.altNames?.map((n) => n.value || n.ip || "")
      .filter(Boolean)
      .join(", ") || "None";

  return [
    { label: "Subject", value: cert.subject.attributes.map((a) => `${a.shortName || a.name}=${a.value}`).join(", ") },
    { label: "Issuer", value: cert.issuer.attributes.map((a) => `${a.shortName || a.name}=${a.value}`).join(", ") },
    { label: "Serial", value: cert.serialNumber },
    { label: "Not before", value: cert.validity.notBefore.toISOString() },
    { label: "Not after", value: cert.validity.notAfter.toISOString() },
    { label: "SANs", value: sans },
    { label: "SHA-256 fingerprint", value: sha256.digest().toHex().toUpperCase().match(/.{2}/g)?.join(":") ?? "" },
    { label: "SHA-1 fingerprint", value: sha1.digest().toHex().toUpperCase().match(/.{2}/g)?.join(":") ?? "" },
  ];
}

export async function inspectCsrPem(pem: string): Promise<InspectedField[]> {
  const forge = await loadForge();
  const csr = forge.pki.certificationRequestFromPem(pem);
  const subject = csr.subject.attributes.map((a) => `${a.shortName || a.name}=${a.value}`).join(", ");
  return [
    { label: "Subject", value: subject },
    {
      label: "Signature",
      value: typeof csr.verify === "function" && csr.verify() ? "Valid self-signature" : "Present",
    },
  ];
}
