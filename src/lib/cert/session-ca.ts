import type { SessionCa } from "./types";

let sessionCa: SessionCa | null = null;

export function getSessionCa() {
  return sessionCa;
}

export function setSessionCa(next: SessionCa | null) {
  sessionCa = next;
}
