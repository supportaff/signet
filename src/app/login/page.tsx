import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Signet with Google. Certificates are still generated locally.",
};

export default function LoginPage() {
  return (
    <div className="flex justify-center px-5 py-16">
      <Suspense fallback={<div className="h-96 w-full max-w-md rounded-[28px] skeleton" />}>
        <AuthCard mode="login" />
      </Suspense>
    </div>
  );
}
