"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { derBytesToPem, extractPemBlocks, pemToDerBytes, pemToPfx, pfxToPem } from "@/lib/cert/convert";
import { asBlobPart, downloadBlob } from "@/lib/utils";

export function ConvertBox() {
  const [pem, setPem] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const certPem = extractPemBlocks(pem).find((block) => block.includes("BEGIN CERTIFICATE")) || "";
  const keyPem = extractPemBlocks(pem).find((block) => block.includes("PRIVATE KEY")) || "";

  const downloadDer = () => {
    if (!certPem) return toast.error("Paste a PEM certificate first.");
    downloadBlob("certificate.der", new Blob([asBlobPart(pemToDerBytes(certPem))]), "application/pkix-cert");
  };

  const wrapDer = async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    setPem(derBytesToPem(bytes, "CERTIFICATE"));
    toast.success("Wrapped DER as PEM in the box. Nothing was uploaded.");
  };

  const makePfx = async () => {
    if (!certPem || !keyPem) return toast.error("PFX needs both a certificate and a private key PEM.");
    if (!password) return toast.error("Set a PFX password.");
    setBusy(true);
    try {
      const bytes = await pemToPfx(certPem, keyPem, password);
      downloadBlob("certificate.pfx", new Blob([asBlobPart(bytes)]), "application/x-pkcs12");
    } catch {
      toast.error("Could not build that PFX. Check the key matches the certificate.");
    } finally {
      setBusy(false);
    }
  };

  const unpackPfx = async (file: File) => {
    if (!password) return toast.error("Enter the PFX password first.");
    setBusy(true);
    try {
      const unpacked = await pfxToPem(new Uint8Array(await file.arrayBuffer()), password);
      setPem([unpacked.privateKeyPem, ...unpacked.certificatesPem].join("\n"));
      toast.success("Unpacked locally. Download or copy the PEMs.");
    } catch {
      toast.error("Could not open that PFX. Wrong password or a damaged file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={pem}
        onChange={(event) => setPem(event.target.value)}
        rows={12}
        placeholder="Paste PEM certificate and optional private key, or unpack a PFX below."
        className="w-full rounded-2xl border border-line bg-surface px-3.5 py-3 font-mono text-[12px] outline-none focus:border-wax/70 focus:ring-4 focus:ring-wax/15"
      />
      <div>
        <Label htmlFor="pfx-pass">PFX password</Label>
        <Input
          id="pfx-pass"
          type="password"
          className="mt-1.5 max-w-sm"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="wax" onClick={downloadDer} disabled={!certPem}>
          Download DER
        </Button>
        <Button variant="outline" onClick={() => void makePfx()} disabled={busy}>
          Build PFX
        </Button>
        <label className="inline-flex">
          <span className="sr-only">Open DER</span>
          <input
            type="file"
            className="hidden"
            accept=".der,.cer,.crt,.bin"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void wrapDer(file);
              event.target.value = "";
            }}
          />
          <Button variant="outline" type="button" onClick={(event) => event.currentTarget.previousElementSibling && (event.currentTarget.previousElementSibling as HTMLInputElement).click()}>
            Open DER
          </Button>
        </label>
        <label className="inline-flex">
          <input
            type="file"
            className="hidden"
            accept=".pfx,.p12"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void unpackPfx(file);
              event.target.value = "";
            }}
          />
          <Button variant="outline" type="button" onClick={(event) => event.currentTarget.previousElementSibling && (event.currentTarget.previousElementSibling as HTMLInputElement).click()}>
            Unpack PFX
          </Button>
        </label>
      </div>
    </div>
  );
}
