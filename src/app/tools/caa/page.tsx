import type { Metadata } from "next";
import { CaaTool } from "@/components/tools/caa-tool";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "CAA record lookup",
  description:
    "See which certificate authorities are allowed to issue for a domain. CAA records are public DNS, read live and not stored.",
  path: "/tools/caa",
  keywords: ["CAA record checker", "CAA lookup", "which CA can issue"],
});

export default function CaaPage() {
  return (
    <ToolPage
      path="/tools/caa"
      title="CAA record lookup."
      lede="DNS CAA tells the world which certificate authorities may issue for a name. Paste a domain and read the public records."
    >
      <CaaTool />
    </ToolPage>
  );
}
