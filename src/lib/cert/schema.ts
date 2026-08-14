import { z } from "zod";
import { CERT_TYPES, KEY_ALGORITHMS } from "./types";

export const certFormSchema = z
  .object({
    type: z.enum(CERT_TYPES),
    commonName: z.string().trim().min(1, "A common name is required — a hostname, service, or person."),
    sans: z.array(
      z.object({
        type: z.enum(["dns", "ip", "email", "uri"]),
        value: z.string().trim().min(1),
      }),
    ),
    organization: z.string(),
    organizationalUnit: z.string(),
    country: z
      .string()
      .refine((value) => value === "" || value.length === 2, "Country must be a two-letter ISO code."),
    state: z.string(),
    locality: z.string(),
    email: z
      .string()
      .refine((value) => value === "" || z.string().email().safeParse(value).success, "Enter a valid email or leave it blank."),
    validityDays: z.number().min(1).max(3650),
    keyAlgorithm: z.enum(KEY_ALGORITHMS),
    caCertificatePem: z.string(),
    caPrivateKeyPem: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.type !== "host") return;
    if (!value.caCertificatePem.includes("BEGIN CERTIFICATE")) {
      ctx.addIssue({
        code: "custom",
        path: ["caCertificatePem"],
        message: "A host certificate needs your Root CA .crt. Forge a Root CA first, or paste it here.",
      });
    }
    if (!value.caPrivateKeyPem.includes("BEGIN") || !value.caPrivateKeyPem.includes("PRIVATE KEY")) {
      ctx.addIssue({
        code: "custom",
        path: ["caPrivateKeyPem"],
        message: "A host certificate needs the matching Root CA private key. It is used only in this tab.",
      });
    }
  });
