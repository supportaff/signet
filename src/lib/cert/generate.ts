import type * as ForgeNS from "node-forge";
import type { CertFormValues, GeneratedCertificate, SubjectAltName } from "./types";

type Forge = typeof ForgeNS;

async function loadForge(): Promise<Forge> {
  const imported = await import("node-forge");
  const mod = imported as unknown as { default?: Forge } & Forge;
  return (mod.default ?? mod) as Forge;
}

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sig_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function generateKeyPair(forge: Forge, bits: number): Promise<{
  publicKey: import("node-forge").pki.rsa.PublicKey;
  privateKey: import("node-forge").pki.rsa.PrivateKey;
}> {
  return new Promise((resolve, reject) => {
    try {
      resolve(forge.pki.rsa.generateKeyPair({ bits }));
    } catch (error) {
      reject(error);
    }
  });
}

function buildSubject(values: CertFormValues) {
  const attrs: { shortName?: string; name?: string; value: string }[] = [
    { shortName: "CN", value: values.commonName.trim() },
  ];
  if (values.organization.trim()) {
    attrs.push({ shortName: "O", value: values.organization.trim() });
  }
  if (values.organizationalUnit.trim()) {
    attrs.push({ shortName: "OU", value: values.organizationalUnit.trim() });
  }
  if (values.locality.trim()) {
    attrs.push({ shortName: "L", value: values.locality.trim() });
  }
  if (values.state.trim()) {
    attrs.push({ shortName: "ST", value: values.state.trim() });
  }
  if (values.country.trim()) {
    attrs.push({ shortName: "C", value: values.country.trim().toUpperCase() });
  }
  if (values.email.trim()) {
    attrs.push({ name: "emailAddress", value: values.email.trim() });
  }
  return attrs;
}

function formatDn(attrs: { shortName?: string; name?: string; value: string }[]) {
  return attrs
    .map((attr) => `${attr.shortName || attr.name}=${attr.value}`)
    .join(", ");
}

function toAltNames(sans: SubjectAltName[]) {
  return sans
    .filter((san) => san.value.trim())
    .map((san) => {
      const value = san.value.trim();
      switch (san.type) {
        case "ip":
          return { type: 7, ip: value };
        case "email":
          return { type: 1, value };
        case "uri":
          return { type: 6, value };
        default:
          return { type: 2, value };
      }
    });
}

function fingerprint(forge: Forge, cert: import("node-forge").pki.Certificate, algo: "sha1" | "sha256") {
  const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const md = algo === "sha1" ? forge.md.sha1.create() : forge.md.sha256.create();
  md.update(der);
  return md.digest().toHex();
}

function serialHex(forge: Forge) {
  const bytes = forge.random.getBytesSync(16);
  const chars = bytes.split("");
  chars[0] = String.fromCharCode(chars[0].charCodeAt(0) & 0x7f);
  return forge.util.bytesToHex(chars.join(""));
}

export async function generateCertificateBundle(
  values: CertFormValues,
): Promise<GeneratedCertificate> {
  const forge = await loadForge();
  const bits = values.keyAlgorithm === "rsa-4096" ? 4096 : 2048;
  const keys = await generateKeyPair(forge, bits);
  const subject = buildSubject(values);
  const now = new Date();
  const notBefore = new Date(now.getTime() - 5 * 60 * 1000);
  const notAfter = new Date(now.getTime() + values.validityDays * 24 * 60 * 60 * 1000);
  const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);

  if (values.type === "host") {
    return issueHostCertificate(forge, values, keys, subject, now, notBefore, notAfter, publicKeyPem, privateKeyPem);
  }

  if (values.type === "csr") {
    const csr = forge.pki.createCertificationRequest();
    csr.publicKey = keys.publicKey;
    csr.setSubject(subject);
    const altNames = toAltNames(values.sans);
    if (altNames.length > 0) {
      csr.setAttributes([
        {
          name: "extensionRequest",
          extensions: [{ name: "subjectAltName", altNames }],
        },
      ]);
    }
    csr.sign(keys.privateKey, forge.md.sha256.create());
    const csrPem = forge.pki.certificationRequestToPem(csr);

    return {
      id: randomId(),
      type: values.type,
      commonName: values.commonName.trim(),
      sans: values.sans.filter((s) => s.value.trim()),
      organization: values.organization.trim(),
      organizationalUnit: values.organizationalUnit.trim(),
      country: values.country.trim().toUpperCase(),
      state: values.state.trim(),
      locality: values.locality.trim(),
      email: values.email.trim(),
      validityDays: values.validityDays,
      keyAlgorithm: values.keyAlgorithm,
      createdAt: now.toISOString(),
      notBefore: notBefore.toISOString(),
      notAfter: notAfter.toISOString(),
      serialNumber: "",
      fingerprintSha1: "",
      fingerprintSha256: "",
      subject: formatDn(subject),
      issuer: "",
      certificatePem: "",
      privateKeyPem,
      publicKeyPem,
      csrPem,
      combinedPem: null,
      caCertificatePem: null,
      chainPem: null,
    };
  }

  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = serialHex(forge);
  cert.validity.notBefore = notBefore;
  cert.validity.notAfter = notAfter;
  cert.setSubject(subject);
  cert.setIssuer(subject);

  const altNames = toAltNames(values.sans);
  const isRoot = values.type === "root-ca";
  const isSelfSignedLeaf = values.type === "self-signed";
  const extensions: Record<string, unknown>[] = isRoot
    ? [
        { name: "basicConstraints", cA: true, pathLenConstraint: 0, critical: true },
        { name: "keyUsage", keyCertSign: true, cRLSign: true, critical: true },
        { name: "subjectKeyIdentifier" },
      ]
    : [
        { name: "basicConstraints", cA: false },
        {
          name: "keyUsage",
          digitalSignature: true,
          keyEncipherment: true,
          dataEncipherment: isSelfSignedLeaf,
          critical: true,
        },
        {
          name: "extKeyUsage",
          serverAuth: isSelfSignedLeaf,
          clientAuth: values.type === "client" || isSelfSignedLeaf,
        },
        { name: "subjectKeyIdentifier" },
      ];
  if (altNames.length > 0) {
    extensions.push({ name: "subjectAltName", altNames });
  }
  cert.setExtensions(extensions);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const certificatePem = forge.pki.certificateToPem(cert);
  return {
    id: randomId(),
    type: values.type,
    commonName: values.commonName.trim(),
    sans: values.sans.filter((s) => s.value.trim()),
    organization: values.organization.trim(),
    organizationalUnit: values.organizationalUnit.trim(),
    country: values.country.trim().toUpperCase(),
    state: values.state.trim(),
    locality: values.locality.trim(),
    email: values.email.trim(),
    validityDays: values.validityDays,
    keyAlgorithm: values.keyAlgorithm,
    createdAt: now.toISOString(),
    notBefore: notBefore.toISOString(),
    notAfter: notAfter.toISOString(),
    serialNumber: cert.serialNumber,
    fingerprintSha1: fingerprint(forge, cert, "sha1"),
    fingerprintSha256: fingerprint(forge, cert, "sha256"),
    subject: formatDn(subject),
    issuer: formatDn(subject),
    certificatePem,
    privateKeyPem,
    publicKeyPem,
    csrPem: null,
    combinedPem: `${certificatePem.trim()}\n${privateKeyPem.trim()}\n`,
    caCertificatePem: null,
    chainPem: null,
  };
}

function issueHostCertificate(
  forge: Forge,
  values: CertFormValues,
  keys: {
    publicKey: import("node-forge").pki.rsa.PublicKey;
    privateKey: import("node-forge").pki.rsa.PrivateKey;
  },
  subject: { shortName?: string; name?: string; value: string }[],
  now: Date,
  notBefore: Date,
  notAfter: Date,
  publicKeyPem: string,
  privateKeyPem: string,
): GeneratedCertificate {
  let caCert: import("node-forge").pki.Certificate;
  let caKey: import("node-forge").pki.rsa.PrivateKey;
  try {
    caCert = forge.pki.certificateFromPem(values.caCertificatePem);
    caKey = forge.pki.privateKeyFromPem(values.caPrivateKeyPem);
  } catch {
    throw new Error("Could not read the Root CA files. Paste a PEM certificate and its matching private key.");
  }

  const basic = caCert.getExtension("basicConstraints") as { cA?: boolean } | undefined;
  if (!basic?.cA) {
    throw new Error("That certificate is not a CA. Forge a Root CA first, then sign the host with it.");
  }

  const caPublic = caCert.publicKey as import("node-forge").pki.rsa.PublicKey;
  if (!caPublic.n || !caKey.n || caPublic.n.compareTo(caKey.n) !== 0) {
    throw new Error("The CA private key does not match the CA certificate.");
  }

  if (caCert.validity.notAfter.getTime() < notAfter.getTime()) {
    throw new Error("The host would outlive the Root CA. Shorten the host validity, or issue a longer CA.");
  }

  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = serialHex(forge);
  cert.validity.notBefore = notBefore;
  cert.validity.notAfter = notAfter;
  cert.setSubject(subject);
  cert.setIssuer(caCert.subject.attributes);

  const altNames = toAltNames(values.sans);
  const extensions: Record<string, unknown>[] = [
    { name: "basicConstraints", cA: false },
    {
      name: "keyUsage",
      digitalSignature: true,
      keyEncipherment: true,
      critical: true,
    },
    { name: "extKeyUsage", serverAuth: true, clientAuth: true },
    { name: "subjectKeyIdentifier" },
    { name: "authorityKeyIdentifier", keyIdentifier: true },
  ];
  if (altNames.length > 0) {
    extensions.push({ name: "subjectAltName", altNames });
  }
  cert.setExtensions(extensions);
  cert.sign(caKey, forge.md.sha256.create());

  const certificatePem = forge.pki.certificateToPem(cert);
  const caCertificatePem = forge.pki.certificateToPem(caCert);
  const issuer = caCert.subject.attributes
    .map((attr) => `${attr.shortName || attr.name}=${attr.value}`)
    .join(", ");

  return {
    id: randomId(),
    type: values.type,
    commonName: values.commonName.trim(),
    sans: values.sans.filter((s) => s.value.trim()),
    organization: values.organization.trim(),
    organizationalUnit: values.organizationalUnit.trim(),
    country: values.country.trim().toUpperCase(),
    state: values.state.trim(),
    locality: values.locality.trim(),
    email: values.email.trim(),
    validityDays: values.validityDays,
    keyAlgorithm: values.keyAlgorithm,
    createdAt: now.toISOString(),
    notBefore: notBefore.toISOString(),
    notAfter: notAfter.toISOString(),
    serialNumber: cert.serialNumber,
    fingerprintSha1: fingerprint(forge, cert, "sha1"),
    fingerprintSha256: fingerprint(forge, cert, "sha256"),
    subject: formatDn(subject),
    issuer,
    certificatePem,
    privateKeyPem,
    publicKeyPem,
    csrPem: null,
    combinedPem: `${certificatePem.trim()}\n${privateKeyPem.trim()}\n`,
    caCertificatePem,
    chainPem: `${certificatePem.trim()}\n${caCertificatePem.trim()}\n`,
  };
}

export async function buildPkcs12(
  certificatePem: string,
  privateKeyPem: string,
  password: string,
  friendlyName: string,
  extraCertificatePem?: string | null,
): Promise<Uint8Array> {
  const forge = await loadForge();
  const cert = forge.pki.certificateFromPem(certificatePem);
  const key = forge.pki.privateKeyFromPem(privateKeyPem);
  const chain = [cert];
  if (extraCertificatePem) {
    chain.push(forge.pki.certificateFromPem(extraCertificatePem));
  }
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(key, chain, password, {
    algorithm: "3des",
    friendlyName: friendlyName || "signet",
    generateLocalKeyId: true,
  });
  const der = forge.asn1.toDer(p12Asn1).getBytes();
  const bytes = new Uint8Array(der.length);
  for (let i = 0; i < der.length; i += 1) {
    bytes[i] = der.charCodeAt(i) & 0xff;
  }
  return bytes;
}
