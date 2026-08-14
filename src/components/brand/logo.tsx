import Link from "next/link";
import { cn } from "@/lib/utils";

export function SealMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7", className)}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" className="fill-wax" />
      <circle
        cx="16"
        cy="16"
        r="12.2"
        className="fill-none stroke-white/70"
        strokeWidth="0.8"
      />
      <path
        d="M11.2 21.2V10.8h5.1c2.4 0 3.9 1.3 3.9 3.3 0 1.4-.8 2.4-2.1 2.9 1.6.4 2.6 1.6 2.6 3.3 0 2.2-1.7 3.9-4.5 3.9H11.2zm2.5-6.4h2.4c1.2 0 1.9-.6 1.9-1.5s-.7-1.5-1.9-1.5h-2.4v3zm0 4.6h2.8c1.4 0 2.2-.7 2.2-1.8s-.8-1.7-2.2-1.7h-2.8v3.5z"
        className="fill-white"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
  markOnly = false,
}: {
  href?: string;
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 text-ink", className)}
    >
      <SealMark />
      {markOnly ? (
        <span className="sr-only">Signet</span>
      ) : (
        <span className="font-serif text-[1.35rem] leading-none tracking-[-0.03em]">
          Signet
        </span>
      )}
    </Link>
  );
}
