"use client";

import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { detectSanType, type SanType, type SubjectAltName } from "@/lib/cert/types";

const labels: Record<SanType, string> = {
  dns: "DNS",
  ip: "IP",
  email: "Email",
  uri: "URI",
};

export function SanInput({
  value,
  onChange,
}: {
  value: SubjectAltName[];
  onChange: (next: SubjectAltName[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const next = raw.trim();
    if (!next) return;
    if (value.some((san) => san.value.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, { type: detectSanType(next), value: next }]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    }
    if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface px-2.5 py-2 focus-within:border-wax/70 focus-within:ring-4 focus-within:ring-wax/15">
      <div className="flex flex-wrap gap-1.5">
        {value.map((san, index) => (
          <span
            key={`${san.type}-${san.value}-${index}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-bg-muted px-2.5 py-1 text-xs"
          >
            <span className="text-[10px] uppercase tracking-wider text-muted">
              {labels[san.type]}
            </span>
            <span className="font-medium">{san.value}</span>
            <button
              type="button"
              className="rounded-full p-0.5 text-muted hover:bg-line hover:text-ink"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              aria-label={`Remove ${san.value}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={value.length ? "Add another…" : "localhost, 127.0.0.1, *.dev.local"}
          className="h-8 min-w-[180px] flex-1 border-0 bg-transparent px-1 shadow-none focus:ring-0"
        />
      </div>
    </div>
  );
}
