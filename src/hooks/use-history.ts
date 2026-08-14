"use client";

import { useEffect, useState } from "react";
import type { CertificateMetadata } from "@/lib/cert/types";
import { readHistory } from "@/lib/history";

export function useHistory() {
  const [items, setItems] = useState<CertificateMetadata[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setItems(readHistory());
      setReady(true);
    };
    sync();
    window.addEventListener("signet-history", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("signet-history", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { items, ready };
}
