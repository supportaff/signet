import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const names = [
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "AUTH_SECRET",
  "ADMIN_EMAILS",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DODO_PAYMENTS_API_KEY",
  "DODO_PAYMENTS_WEBHOOK_KEY",
  "DODO_PAYMENTS_ENVIRONMENT",
  "DODO_PAYMENTS_RETURN_URL",
  "DODO_PRODUCT_PLUS",
  "DODO_PRODUCT_STUDIO",
];

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/g, "")];
    }),
);

for (const name of names) {
  const value = env[name];
  if (!value) {
    console.log(`skip ${name} (empty)`);
    continue;
  }
  const result = spawnSync("vercel", ["env", "add", name, "production", "--force", "--yes"], {
    input: value,
    encoding: "utf8",
    shell: true,
  });
  if (result.status === 0) {
    console.log(`set ${name}`);
  } else {
    console.log(`fail ${name}`);
    if (result.stderr) console.log(result.stderr.split("\n").slice(0, 4).join("\n"));
  }
}
