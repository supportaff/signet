import type { CertificateMetadata, GeneratedCertificate } from "@/lib/cert/types";

export const HISTORY_STORAGE_KEY = "signet.history.v1";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readHistory(): CertificateMetadata[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const items = raw ? (JSON.parse(raw) as CertificateMetadata[]) : [];
    return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch {
    return [];
  }
}

export function writeHistory(items: CertificateMetadata[]) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("signet-history"));
}

export function toMetadata(bundle: GeneratedCertificate): CertificateMetadata {
  return {
    id: bundle.id,
    type: bundle.type,
    commonName: bundle.commonName,
    sans: bundle.sans.map((s) => s.value),
    organization: bundle.organization,
    keyAlgorithm: bundle.keyAlgorithm,
    createdAt: bundle.createdAt,
    notAfter: bundle.type === "csr" ? null : bundle.notAfter,
    fingerprintSha256: bundle.fingerprintSha256,
    serialNumber: bundle.serialNumber,
  };
}

export function recordGeneration(bundle: GeneratedCertificate) {
  const items = readHistory().filter((item) => item.id !== bundle.id);
  items.unshift(toMetadata(bundle));
  writeHistory(items.slice(0, 25));
}

export function deleteHistoryItem(id: string) {
  writeHistory(readHistory().filter((item) => item.id !== id));
}

export function clearHistory() {
  writeHistory([]);
}

export function seedDemoHistory() {
  if (readHistory().length > 0) return;
  const now = Date.now();
  const demo: CertificateMetadata[] = [
    {
      id: "meta-1",
      type: "root-ca",
      commonName: "Northwind Root CA",
      sans: ["api.internal.dev", "localhost"],
      organization: "Northwind Labs",
      keyAlgorithm: "rsa-2048",
      createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      notAfter: new Date(now + 1000 * 60 * 60 * 24 * 360).toISOString(),
      fingerprintSha256: "a4f1c8e29b0d77e1c6a9b3d4e5f60718293a4b5c6d7e8f90123456789abcdef0",
      serialNumber: "3f8c1a90b2e44d11",
    },
    {
      id: "meta-2",
      type: "host",
      commonName: "api.internal.dev",
      sans: ["api.internal.dev", "localhost"],
      organization: "Northwind Labs",
      keyAlgorithm: "rsa-2048",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
      notAfter: new Date(now + 1000 * 60 * 60 * 24 * 80).toISOString(),
      fingerprintSha256: "91bb0c44d2aa18ef0077c1d2e3f405162738495a6b7c8d9e0f1a2b3c4d5e6f70",
      serialNumber: "9aa0172c44de81f0",
    },
    {
      id: "meta-3",
      type: "csr",
      commonName: "shop.example.com",
      sans: ["shop.example.com", "www.shop.example.com"],
      organization: "Example Retail",
      keyAlgorithm: "rsa-4096",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 12).toISOString(),
      notAfter: null,
      fingerprintSha256: "",
      serialNumber: "",
    },
  ];
  writeHistory(demo);
}
