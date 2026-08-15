import { asBlobPart, downloadBlob, sanitizeFilename } from "@/lib/utils";
import { buildPkcs12 } from "./generate";
import type { GeneratedCertificate } from "./types";

export function baseName(bundle: GeneratedCertificate) {
  return sanitizeFilename(bundle.commonName);
}

export function downloadCertificate(bundle: GeneratedCertificate) {
  downloadBlob(`${baseName(bundle)}.crt`, bundle.certificatePem, "application/x-x509-ca-cert");
}

export function downloadPrivateKey(bundle: GeneratedCertificate) {
  if (!bundle.privateKeyPem) return;
  downloadBlob(`${baseName(bundle)}.key`, bundle.privateKeyPem, "application/x-pem-file");
}

export function downloadPem(bundle: GeneratedCertificate) {
  const body = bundle.combinedPem || bundle.certificatePem || bundle.csrPem || "";
  downloadBlob(`${baseName(bundle)}.pem`, body, "application/x-pem-file");
}

export function downloadCaCertificate(bundle: GeneratedCertificate) {
  if (!bundle.caCertificatePem) return;
  downloadBlob(`${baseName(bundle)}-ca.crt`, bundle.caCertificatePem, "application/x-x509-ca-cert");
}

export function downloadChain(bundle: GeneratedCertificate) {
  if (!bundle.chainPem) return;
  downloadBlob(`${baseName(bundle)}-chain.pem`, bundle.chainPem, "application/x-pem-file");
}

export function downloadCsr(bundle: GeneratedCertificate) {
  if (!bundle.csrPem) return;
  downloadBlob(`${baseName(bundle)}.csr`, bundle.csrPem, "application/pkcs10");
}

export function downloadPublicKey(bundle: GeneratedCertificate) {
  downloadBlob(`${baseName(bundle)}.pub.pem`, bundle.publicKeyPem, "application/x-pem-file");
}

export async function downloadPfx(bundle: GeneratedCertificate, password: string) {
  if (!bundle.privateKeyPem || !bundle.certificatePem) return;
  const bytes = await buildPkcs12(
    bundle.certificatePem,
    bundle.privateKeyPem,
    password,
    bundle.commonName,
    bundle.caCertificatePem,
  );
  downloadBlob(
    `${baseName(bundle)}.pfx`,
    new Blob([asBlobPart(bytes)], { type: "application/x-pkcs12" }),
  );
}

export async function downloadZip(bundle: GeneratedCertificate, pfxPassword?: string) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const name = baseName(bundle);
  const readme = [
    `SelfSignedCert export — ${bundle.commonName}`,
    ``,
    `Type: ${bundle.type}`,
    `Created: ${bundle.createdAt}`,
    `Algorithm: ${bundle.keyAlgorithm}`,
    bundle.fingerprintSha256 ? `SHA-256: ${bundle.fingerprintSha256}` : "",
    ``,
    `This archive was assembled in your browser.`,
    `SelfSignedCert never received these files.`,
    ``,
    `Keep the private key offline. Anyone with the key can impersonate this identity.`,
  ]
    .filter(Boolean)
    .join("\n");

  zip.file("README.txt", readme);
  if (bundle.certificatePem) zip.file(`${name}.crt`, bundle.certificatePem);
  if (bundle.privateKeyPem) zip.file(`${name}.key`, bundle.privateKeyPem);
  if (bundle.publicKeyPem) zip.file(`${name}.pub.pem`, bundle.publicKeyPem);
  if (bundle.combinedPem) zip.file(`${name}.pem`, bundle.combinedPem);
  if (bundle.caCertificatePem) zip.file(`${name}-ca.crt`, bundle.caCertificatePem);
  if (bundle.chainPem) zip.file(`${name}-chain.pem`, bundle.chainPem);
  if (bundle.csrPem) zip.file(`${name}.csr`, bundle.csrPem);
  if (bundle.certificatePem && bundle.privateKeyPem && pfxPassword !== undefined) {
    const bytes = await buildPkcs12(
      bundle.certificatePem,
      bundle.privateKeyPem,
      pfxPassword,
      bundle.commonName,
      bundle.caCertificatePem,
    );
    zip.file(`${name}.pfx`, bytes);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(`${name}-signet.zip`, blob, "application/zip");
}
