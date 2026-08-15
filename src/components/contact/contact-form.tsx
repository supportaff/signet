"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { site } from "@/lib/site";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent(`SelfSignedCert support from ${name}`);
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
    window.location.href = `mailto:${site.supportEmail}?subject=${subject}&body=${body}`;
    setSent(true);
    toast.success("Your email app should open with the message ready to send.");
  };

  if (sent) {
    return (
      <div className="mt-10 rounded-[28px] border border-line bg-surface p-8">
        <p className="font-serif text-3xl">Send it from your inbox.</p>
        <p className="mt-3 text-sm text-muted">
          If nothing opened, email{" "}
          <a className="text-wax hover:underline" href={`mailto:${site.supportEmail}`}>
            {site.supportEmail}
          </a>
          . Do not attach a private key.
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
        Open email to {site.supportEmail}
      </Button>
    </form>
  );
}
