import { buildPkcs12 } from "@/lib/cert/generate";

type Forge = typeof import("node-forge");

async function loadForge(): Promise<Forge> {
  const imported = await import("node-forge");
  const mod = imported as unknown as { default?: Forge } & Forge;
  return (mod.default ?? mod) as Forge;
}

export function extractPemBlocks(input: string) {
  const matches = input.match(/-----BEGIN [^-]+-----[\s\S]+?-----END [^-]+-----/g) ?? [];
  return matches.map((block) => block.trim());
}

export function pemToDerBytes(pem: string) {
  const body = pem
    .replace(/-----(BEGIN|END)[^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function derBytesToPem(bytes: Uint8Array, label: string) {
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  const b64 = btoa(binary);
  const lines = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
}

export async function pfxToPem(bytes: Uint8Array, password: string) {
  const forge = await loadForge();
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  const asn1 = forge.asn1.fromDer(binary);
  const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, password);
  const shrouded = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
    forge.pki.oids.pkcs8ShroudedKeyBag
  ];
  const plain = p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag];
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
  const key = shrouded?.[0]?.key || plain?.[0]?.key;
  const certs = (certBags ?? []).map((bag) => bag.cert).filter(Boolean);
  if (!key || !certs.length) throw new Error("That PFX did not contain a key and certificate.");
  return {
    privateKeyPem: forge.pki.privateKeyToPem(key),
    certificatesPem: certs.map((cert) => forge.pki.certificateToPem(cert!)),
  };
}

export async function pemToPfx(certificatePem: string, privateKeyPem: string, password: string) {
  return buildPkcs12(certificatePem, privateKeyPem, password, "certificate");
}
