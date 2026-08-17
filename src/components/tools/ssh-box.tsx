"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSshKey, type SshAlgorithm } from "@/lib/ssh";
import { downloadBlob } from "@/lib/utils";

export function SshBox() {
  const [algorithm, setAlgorithm] = useState<SshAlgorithm>("rsa-2048");
  const [comment, setComment] = useState("selfsignedcert");
  const [busy, setBusy] = useState(false);
  const [pair, setPair] = useState<Awaited<ReturnType<typeof generateSshKey>> | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      const next = await generateSshKey(algorithm, comment);
      setPair(next);
    } catch {
      toast.error("Could not generate that key in this browser.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="ssh-alg">Algorithm</Label>
          <select
            id="ssh-alg"
            className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm"
            value={algorithm}
            onChange={(event) => setAlgorithm(event.target.value as SshAlgorithm)}
          >
            <option value="rsa-2048">RSA 2048</option>
            <option value="rsa-4096">RSA 4096</option>
            <option value="ecdsa-p256">ECDSA P-256</option>
          </select>
        </div>
        <div>
          <Label htmlFor="ssh-comment">Comment</Label>
          <Input id="ssh-comment" className="mt-1.5" value={comment} onChange={(event) => setComment(event.target.value)} />
        </div>
      </div>
      <Button variant="wax" disabled={busy} onClick={() => void run()}>
        {busy ? "Minting in this tab…" : "Generate SSH key"}
      </Button>
      {pair ? (
        <div className="space-y-3">
          <pre className="overflow-x-auto rounded-2xl border border-line bg-surface p-4 text-[12px]">{pair.publicOpenSsh}</pre>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(pair.publicOpenSsh);
                toast.success("Public key copied.");
              }}
            >
              Copy public key
            </Button>
            <Button variant="outline" onClick={() => downloadBlob("id_ssh.pub", pair.publicOpenSsh, "text/plain")}>
              Download .pub
            </Button>
            <Button variant="outline" onClick={() => downloadBlob("id_ssh.pem", pair.privatePem, "application/x-pem-file")}>
              Download private PEM
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
