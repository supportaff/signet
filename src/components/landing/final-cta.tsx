import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinalCta() {
  return (
    <section className="border-t border-line px-5 py-20">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-line bg-ink px-8 py-14 text-center text-bg">
        <p className="text-xs uppercase tracking-[0.2em] text-bg/60">Ready when you are</p>
        <h2 className="display mx-auto mt-4 max-w-xl text-4xl sm:text-5xl">
          Make a certificate nobody else will ever hold.
        </h2>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/generate"
            className={cn(buttonVariants({ variant: "wax", size: "lg" }))}
          >
            Open the generator
          </Link>
          <Link
            href="/privacy"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/15 text-bg hover:bg-white/10",
            )}
          >
            Read the privacy posture
          </Link>
        </div>
      </div>
    </section>
  );
}
