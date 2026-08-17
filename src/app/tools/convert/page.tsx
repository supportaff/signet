import type { Metadata } from "next";
import { ConvertBox } from "@/components/tools/convert-box";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "PEM DER PFX converter — convert certificates in the browser",
  description:
    "Convert PEM, DER, and PFX/PKCS#12 certificates locally. Private keys never leave this tab.",
  path: "/tools/convert",
  keywords: ["PEM to PFX", "DER to PEM", "PKCS12 converter", "convert SSL certificate"],
});

export default function ConvertPage() {
  return (
    <ToolPage
      path="/tools/convert"
      title="PEM, DER, and PFX converter."
      lede="Convert certificate encodings in this browser. Building or unpacking a PFX also happens locally — we never receive the password or the key."
    >
      <ConvertBox />
    </ToolPage>
  );
}
