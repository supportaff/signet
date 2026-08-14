import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-3 text-5xl">This page was never issued.</h1>
      <p className="mt-4 text-ink-soft">
        No certificate, and no route, lives here. Try the generator or go home.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Home
        </Link>
        <Link href="/generate" className={cn(buttonVariants({ variant: "wax" }))}>
          Generate
        </Link>
      </div>
    </div>
  );
}
