import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const forge = require("node-forge");

const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = "01";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
const attrs = [{ shortName: "CN", value: "localhost" }];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  { name: "basicConstraints", cA: true },
  { name: "subjectAltName", altNames: [{ type: 2, value: "localhost" }] },
]);
cert.sign(keys.privateKey, forge.md.sha256.create());
const pem = forge.pki.certificateToPem(cert);
const key = forge.pki.privateKeyToPem(keys.privateKey);
if (!pem.includes("BEGIN CERTIFICATE") || !key.includes("BEGIN RSA PRIVATE KEY")) {
  throw new Error("PEM output missing expected headers");
}
const parsed = forge.pki.certificateFromPem(pem);
if (parsed.subject.getField("CN").value !== "localhost") {
  throw new Error("CN mismatch");
}
console.log("ok self-signed localhost", pem.split("\n")[0]);
