"use client";

import { FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UrlTool({
  action,
  placeholder,
  label,
  children,
}: {
  action: string;
  placeholder: string;
  label: string;
  children: (data: unknown) => ReactNode;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<unknown>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch(action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action.includes("ct-lookup") ? { domain: value } : { url: value }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Lookup failed.");
      setData(payload);
    } catch (error) {
      setData(null);
      toast.error(error instanceof Error ? error.message : "Lookup failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-3 sm:flex-row">
        <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} required />
        <Button type="submit" variant="wax" disabled={busy}>
          {busy ? "Checking…" : label}
        </Button>
      </form>
      {data ? children(data) : null}
    </div>
  );
}
