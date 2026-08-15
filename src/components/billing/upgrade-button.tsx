"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/lib/billing-client";

export function UpgradeButton({
  plan,
  label,
  featured = false,
}: {
  plan: "plus" | "studio";
  label: string;
  featured?: boolean;
}) {
  return (
    <Button
      variant={featured ? "wax" : "outline"}
      className="mt-6 w-full"
      onClick={async () => {
        try {
          await startCheckout(plan);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Checkout failed.");
        }
      }}
    >
      {label}
    </Button>
  );
}
