import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const forge = require("node-forge");

const caKeys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
const ca = forge.pki.createCertificate();
ca.publicKey = caKeys.publicKey;
ca.serialNumber = "01";
ca.validity.notBefore = new Date();
ca.validity.notAfter = new Date();
ca.validity.notAfter.setFullYear(ca.validity.notBefore.getFullYear() + 10);
const caSubject = [{ shortName: "CN", value: "Local Development CA" }];
ca.setSubject(caSubject);
ca.setIssuer(caSubject);
ca.setExtensions([
  { name: "basicConstraints", cA: true, pathLenConstraint: 0, critical: true },
  { name: "keyUsage", keyCertSign: true, cRLSign: true, critical: true },
]);
ca.sign(caKeys.privateKey, forge.md.sha256.create());

const hostKeys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
const host = forge.pki.createCertificate();
host.publicKey = hostKeys.publicKey;
host.serialNumber = "02";
host.validity.notBefore = new Date();
host.validity.notAfter = new Date();
host.validity.notAfter.setFullYear(host.validity.notBefore.getFullYear() + 1);
host.setSubject([{ shortName: "CN", value: "localhost" }]);
host.setIssuer(ca.subject.attributes);
host.setExtensions([
  { name: "basicConstraints", cA: false },
  { name: "keyUsage", digitalSignature: true, keyEncipherment: true },
  { name: "extKeyUsage", serverAuth: true },
  { name: "subjectAltName", altNames: [{ type: 2, value: "localhost" }] },
]);
host.sign(caKeys.privateKey, forge.md.sha256.create());

if (host.issuer.getField("CN").value !== "Local Development CA") {
  throw new Error("host issuer is not the CA");
}
if (host.subject.getField("CN").value !== "localhost") {
  throw new Error("host CN mismatch");
}
const basic = ca.getExtension("basicConstraints");
if (!basic?.cA) throw new Error("CA missing basicConstraints");
console.log("ok root CA + host", host.issuer.getField("CN").value, "->", host.subject.getField("CN").value);
