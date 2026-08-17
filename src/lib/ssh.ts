function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

function pemFromDer(bytes: Uint8Array, label: string) {
  const b64 = bytesToBase64(bytes);
  const lines = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
}

function encodeSshString(value: string | Uint8Array) {
  const data = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const out = new Uint8Array(4 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(data, 4);
  return out;
}

function concat(parts: Uint8Array[]) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function readLength(view: DataView, offset: number) {
  const first = view.getUint8(offset);
  if (first < 0x80) return { length: first, next: offset + 1 };
  const count = first & 0x7f;
  let length = 0;
  for (let i = 0; i < count; i += 1) length = (length << 8) | view.getUint8(offset + 1 + i);
  return { length, next: offset + 1 + count };
}

function enter(view: DataView, offset: number, tag: number) {
  if (view.getUint8(offset) !== tag) throw new Error("Unexpected key encoding.");
  return readLength(view, offset + 1);
}

function skip(view: DataView, offset: number) {
  const body = enter(view, offset, view.getUint8(offset));
  return body.next + body.length;
}

function integerAt(view: DataView, offset: number) {
  const body = enter(view, offset, 0x02);
  return {
    value: new Uint8Array(view.buffer, view.byteOffset + body.next, body.length),
    next: body.next + body.length,
  };
}

function rsaOpensshPublic(spki: Uint8Array) {
  const view = new DataView(spki.buffer, spki.byteOffset, spki.byteLength);
  let cursor = enter(view, 0, 0x30).next;
  cursor = skip(view, cursor);
  const bit = enter(view, cursor, 0x03);
  cursor = bit.next + 1;
  cursor = enter(view, cursor, 0x30).next;
  const n = integerAt(view, cursor);
  const e = integerAt(view, n.next);
  const blob = concat([encodeSshString("ssh-rsa"), encodeSshString(e.value), encodeSshString(n.value)]);
  return `ssh-rsa ${bytesToBase64(blob)}`;
}

function ecdsaOpensshPublic(spki: Uint8Array) {
  const view = new DataView(spki.buffer, spki.byteOffset, spki.byteLength);
  let cursor = enter(view, 0, 0x30).next;
  cursor = skip(view, cursor);
  const bit = enter(view, cursor, 0x03);
  const point = new Uint8Array(view.buffer, view.byteOffset + bit.next + 1, bit.length - 1);
  const blob = concat([
    encodeSshString("ecdsa-sha2-nistp256"),
    encodeSshString("nistp256"),
    encodeSshString(point),
  ]);
  return `ecdsa-sha2-nistp256 ${bytesToBase64(blob)}`;
}

export type SshAlgorithm = "rsa-2048" | "rsa-4096" | "ecdsa-p256";

export async function generateSshKey(algorithm: SshAlgorithm, comment = "selfsignedcert") {
  const rsa = algorithm.startsWith("rsa");
  const key = await crypto.subtle.generateKey(
    rsa
      ? { name: "RSASSA-PKCS1-v1_5", modulusLength: algorithm === "rsa-4096" ? 4096 : 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }
      : { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const publicDer = new Uint8Array(await crypto.subtle.exportKey("spki", key.publicKey));
  const privateDer = new Uint8Array(await crypto.subtle.exportKey("pkcs8", key.privateKey));
  const openssh = `${rsa ? rsaOpensshPublic(publicDer) : ecdsaOpensshPublic(publicDer)} ${comment}`;
  return {
    algorithm,
    publicOpenSsh: openssh,
    publicPem: pemFromDer(publicDer, "PUBLIC KEY"),
    privatePem: pemFromDer(privateDer, "PRIVATE KEY"),
  };
}
