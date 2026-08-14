import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CertPreview } from "@/components/landing/cert-preview";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--wax)_18%,transparent),transparent_42%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
        <div>
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            Zero server storage. Everything happens in this tab.
          </div>
          <h1
            className="display animate-rise mt-6 max-w-xl text-5xl text-ink sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Certificates, forged locally.
          </h1>
          <p
            className="animate-rise mt-6 max-w-lg text-lg leading-relaxed text-ink-soft"
            style={{ animationDelay: "140ms" }}
          >
            Root CAs, host certificates, self-signed TLS, mTLS, and CSRs —
            generated entirely in your browser. We never see your keys. We
            couldn&apos;t if we wanted to.
          </p>
          <div
            className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "200ms" }}
          >
            <Link href="/generate" className={cn(buttonVariants({ variant: "wax", size: "lg" }))}>
              Generate a certificate
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Try the demo account
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface/70 p-4">
              <LockKeyhole className="mt-0.5 h-4 w-4 text-wax" />
              <div>
                <p className="text-sm font-medium">Private keys never upload</p>
                <p className="mt-1 text-sm text-muted">
                  Generation uses Web Workers inside the browser. The network is not in the path.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface/70 p-4">
              <ShieldOff className="mt-0.5 h-4 w-4 text-gold" />
              <div>
                <p className="text-sm font-medium">Nothing we can leak</p>
                <p className="mt-1 text-sm text-muted">
                  History stores metadata you choose. Certificates and keys are gone when you leave.
                </p>
              </div>
            </div>
          </div>
        </div>
        <CertPreview />
      </div>
    </section>
  );
}
