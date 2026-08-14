"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      message: String(data.get("message") || ""),
      at: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("signet.support.v1") || "[]") as unknown[];
    localStorage.setItem("signet.support.v1", JSON.stringify([payload, ...existing]));
    setSent(true);
    toast.success("Message saved locally. This demo has no inbox.");
  };

  if (sent) {
    return (
      <div className="mt-10 rounded-[28px] border border-line bg-surface p-8">
        <p className="font-serif text-3xl">Received on this device.</p>
        <p className="mt-3 text-sm text-muted">
          In production this would email hello@signet.dev. The demo stores the
          note in local storage only.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-4 rounded-[28px] border border-line bg-surface p-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" className="mt-1.5" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" className="mt-1.5" required />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm outline-none focus:border-wax/70 focus:ring-4 focus:ring-wax/15"
        />
      </div>
      <Button type="submit" variant="wax">
        Send message
      </Button>
    </form>
  );
}
