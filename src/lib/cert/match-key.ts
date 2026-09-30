import type { pki } from "node-forge";

type Forge = typeof import("node-forge");
type AnyPublicKey = pki.PublicKey;

export interface KeyMatchResult {
  match: boolean;
  material: "certificate" | "csr";
  keyKind: "private" | "public";
  fingerprint: string;
}

async function loadForge(): Promise<Forge> {
  const imported = await import("node-forge");
  const mod = imported as unknown as { default?: Forge } & Forge;
  return (mod.default ?? mod) as Forge;
}

function spkiHex(forge: Forge, publicKey: AnyPublicKey) {
  const asn1 = forge.pki.publicKeyToAsn1(publicKey);
  const der = forge.asn1.toDer(asn1).getBytes();
  const digest = forge.md.sha256.create();
  digest.update(der);
  return digest.digest().toHex().toUpperCase().match(/.{2}/g)?.join(":") ?? "";
}

export async function matchKeyToMaterial(materialPem: string, keyPem: string): Promise<KeyMatchResult> {
  const forge = await loadForge();
  const materialText = materialPem.trim();
  const keyText = keyPem.trim();
  if (!materialText || !keyText) throw new Error("Paste both a certificate or CSR and a key.");
  if (/ENCRYPTED/.test(keyText)) {
    throw new Error("That private key is encrypted. Decrypt it on your machine, then paste the PEM.");
  }

  let material: KeyMatchResult["material"];
  let materialKey: AnyPublicKey | null;
  if (/BEGIN CERTIFICATE REQUEST|BEGIN NEW CERTIFICATE REQUEST/.test(materialText)) {
    material = "csr";
    materialKey = forge.pki.certificationRequestFromPem(materialText).publicKey;
  } else if (/BEGIN CERTIFICATE/.test(materialText)) {
    material = "certificate";
    materialKey = forge.pki.certificateFromPem(materialText).publicKey;
  } else {
    throw new Error("Paste a PEM certificate or CSR.");
  }
  if (!materialKey) throw new Error("That PEM has no public key.");

  let keyKind: KeyMatchResult["keyKind"] = "public";
  let publicKey: AnyPublicKey;
  if (/PRIVATE KEY/.test(keyText)) {
    const privateKey = forge.pki.privateKeyFromPem(keyText);
    if (!privateKey.n || !privateKey.e) {
      throw new Error("Paste an RSA private key. This check compares RSA moduli.");
    }
    publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
    keyKind = "private";
  } else if (/PUBLIC KEY/.test(keyText)) {
    publicKey = forge.pki.publicKeyFromPem(keyText);
  } else {
    throw new Error("Paste a PEM private key or public key.");
  }

  const left = spkiHex(forge, materialKey);
  const right = spkiHex(forge, publicKey);
  return {
    match: left.length > 0 && left === right,
    material,
    keyKind,
    fingerprint: left,
  };
}
