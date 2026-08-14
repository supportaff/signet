export const CERT_TYPES = ["root-ca", "host", "self-signed", "client", "csr"] as const;
export type CertType = (typeof CERT_TYPES)[number];

export const PKI_TYPES = ["root-ca", "host"] as const;
export const OTHER_TYPES = ["self-signed", "client", "csr"] as const;

export const KEY_ALGORITHMS = ["rsa-2048", "rsa-4096"] as const;
export type KeyAlgorithm = (typeof KEY_ALGORITHMS)[number];

export const VALIDITY_PRESETS = [30, 90, 365, 730, 1825, 3650] as const;

export type SanType = "dns" | "ip" | "email" | "uri";

export interface SubjectAltName {
  type: SanType;
  value: string;
}

export interface CertFormValues {
  type: CertType;
  commonName: string;
  sans: SubjectAltName[];
  organization: string;
  organizationalUnit: string;
  country: string;
  state: string;
  locality: string;
  email: string;
  validityDays: number;
  keyAlgorithm: KeyAlgorithm;
  caCertificatePem: string;
  caPrivateKeyPem: string;
}

export interface SessionCa {
  name: string;
  certificatePem: string;
  privateKeyPem: string;
}

export interface GeneratedCertificate {
  id: string;
  type: CertType;
  commonName: string;
  sans: SubjectAltName[];
  organization: string;
  organizationalUnit: string;
  country: string;
  state: string;
  locality: string;
  email: string;
  validityDays: number;
  keyAlgorithm: KeyAlgorithm;
  createdAt: string;
  notBefore: string;
  notAfter: string;
  serialNumber: string;
  fingerprintSha1: string;
  fingerprintSha256: string;
  subject: string;
  issuer: string;
  certificatePem: string;
  privateKeyPem: string | null;
  publicKeyPem: string;
  csrPem: string | null;
  combinedPem: string | null;
  caCertificatePem: string | null;
  chainPem: string | null;
}

export interface CertificateMetadata {
  id: string;
  type: CertType;
  commonName: string;
  sans: string[];
  organization: string;
  keyAlgorithm: KeyAlgorithm;
  createdAt: string;
  notAfter: string | null;
  fingerprintSha256: string;
  serialNumber: string;
}

export const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "IE", name: "Ireland" },
  { code: "BE", name: "Belgium" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "PL", name: "Poland" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "NZ", name: "New Zealand" },
  { code: "ZA", name: "South Africa" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "IL", name: "Israel" },
];

export const DEFAULT_FORM: CertFormValues = {
  type: "self-signed",
  commonName: "localhost",
  sans: [
    { type: "dns", value: "localhost" },
    { type: "dns", value: "*.localhost" },
    { type: "ip", value: "127.0.0.1" },
  ],
  organization: "",
  organizationalUnit: "",
  country: "US",
  state: "",
  locality: "",
  email: "",
  validityDays: 365,
  keyAlgorithm: "rsa-2048",
  caCertificatePem: "",
  caPrivateKeyPem: "",
};

export function certTypeLabel(type: CertType) {
  switch (type) {
    case "root-ca":
      return "Root CA";
    case "host":
      return "Host certificate";
    case "self-signed":
      return "Self-signed TLS";
    case "client":
      return "Client certificate";
    case "csr":
      return "Certificate request";
  }
}

export function certTypeHint(type: CertType) {
  switch (type) {
    case "root-ca":
      return "A private certificate authority. Trust this once, then issue as many host certs as you need.";
    case "host":
      return "A server certificate signed by your Root CA. Install it on nginx, Caddy, or any HTTPS host.";
    case "self-signed":
      return "A one-off server cert you signed yourself. Fast for a single box. No CA to reuse.";
    case "client":
      return "An mTLS client identity. Install it on a device or service that must prove who it is.";
    case "csr":
      return "A signing request you send to a public or company CA. Never send the private key with it.";
  }
}

export function keyAlgorithmLabel(algo: KeyAlgorithm) {
  return algo === "rsa-4096" ? "RSA 4096-bit" : "RSA 2048-bit";
}

export function validityLabel(days: number) {
  if (days === 30) return "30 days";
  if (days === 90) return "90 days";
  if (days === 365) return "1 year";
  if (days === 730) return "2 years";
  if (days === 1825) return "5 years";
  if (days === 3650) return "10 years";
  if (days % 365 === 0) return `${days / 365} years`;
  return `${days} days`;
}

export function detectSanType(value: string): SanType {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed) || /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return "uri";
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "email";
  }
  if (
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(trimmed) ||
    trimmed.includes(":") && /^[0-9a-f:.]+$/i.test(trimmed)
  ) {
    return "ip";
  }
  return "dns";
}
