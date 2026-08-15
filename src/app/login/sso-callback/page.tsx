"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SsoCallbackPage() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-5 py-16">
      <div className="text-center">
        <p className="font-serif text-2xl">Finishing Google sign-in…</p>
        <p className="mt-2 text-sm text-muted">This tab never receives your private keys.</p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
