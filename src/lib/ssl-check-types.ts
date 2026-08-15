export type SslCheckStatus = "valid" | "expiring" | "expired" | "not_yet_valid" | "untrusted";

export interface SslCheckResult {
  ok: true;
  status: SslCheckStatus;
  statusLabel: string;
  hostnameMatches: boolean;
  trustedByPublicCas: boolean;
  authorizationError: string | null;
  protocol: string | null;
  cipher: string | null;
  host: {
    input: string;
    hostname: string;
    port: number;
    ip: string;
  };
  certificate: {
    subject: string;
    commonName: string | null;
    issuer: string;
    issuerCommonName: string | null;
    serial: string;
    notBefore: string;
    notAfter: string;
    daysRemaining: number;
    sans: string[];
    fingerprintSha1: string;
    fingerprintSha256: string;
    pem: string;
  };
  chain: { subject: string; issuer: string; notAfter: string }[];
}
