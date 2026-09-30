"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function generate(length: number) {
  const out: string[] = [];
  const limit = 256 - (256 % ALPHABET.length);
  while (out.length < length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= limit) continue;
      out.push(ALPHABET[byte % ALPHABET.length] ?? "");
      if (out.length === length) break;
    }
  }
  return out.join("");
}

export function PassphraseBox() {
  const [length, setLength] = useState(24);
  const [value, setValue] = useState("");

  const mint = () => {
    const next = generate(length);
    setValue(next);
    toast.success("Passphrase created in this tab.");
  };

  const copy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success("Copied.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[16, 24, 32].map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setLength(size)}
            className={`rounded-full border px-3 py-1.5 text-sm ${length === size ? "border-wax bg-wax text-bg" : "border-line text-ink-soft"}`}
          >
            {size} characters
          </button>
        ))}
      </div>
      <div className="rounded-3xl border border-line bg-surface p-5">
        <p className="break-all font-mono text-lg tracking-wide">{value || "The passphrase appears here."}</p>
        <p className="mt-3 text-xs text-muted">Use it as a PFX password. It is not stored and it is not sent anywhere.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="wax" onClick={mint}>
          Generate passphrase
        </Button>
        <Button variant="outline" disabled={!value} onClick={() => void copy()}>
          Copy
        </Button>
      </div>
    </div>
  );
}
