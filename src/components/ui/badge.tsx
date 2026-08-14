import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "wax" | "sage" | "gold" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        tone === "default" && "border-line bg-surface-2 text-muted",
        tone === "wax" && "border-wax/20 bg-wax-soft text-wax",
        tone === "sage" && "border-sage/20 bg-sage/10 text-sage",
        tone === "gold" && "border-gold/20 bg-gold/10 text-gold",
        tone === "danger" && "border-danger/20 bg-danger/10 text-danger",
        className,
      )}
      {...props}
    />
  );
}
