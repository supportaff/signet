import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Signet account with Google. We still never store certificates or private keys.",
};

export default function SignupPage() {
  return (
    <div className="flex justify-center px-5 py-16">
      <Suspense fallback={<div className="h-96 w-full max-w-md rounded-[28px] skeleton" />}>
        <AuthCard mode="signup" />
      </Suspense>
    </div>
  );
}
