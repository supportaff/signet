import { readFileSync, unlinkSync, existsSync } from "node:fs";

const path = ".vercel-env-check";
if (!existsSync(path)) {
  console.log("NO_ENV_FILE");
  process.exit(1);
}

const raw = readFileSync(path, "utf8");
const env = Object.fromEntries(
  raw
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      let value = line.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return [line.slice(0, index), value];
    }),
);

const keys = [
  "DODO_PAYMENTS_API_KEY",
  "DODO_PAYMENTS_WEBHOOK_KEY",
  "DODO_PRODUCT_PLUS",
  "DODO_PRODUCT_STUDIO",
  "DODO_PAYMENTS_ENVIRONMENT",
];

for (const key of keys) {
  const value = env[key] || "";
  console.log(key, value ? `SET len=${value.length} start=${JSON.stringify(value.slice(0, 7))}` : "EMPTY");
}

const api = env.DODO_PAYMENTS_API_KEY;
const plus = env.DODO_PRODUCT_PLUS;
const studio = env.DODO_PRODUCT_STUDIO;

async function probe(label, base) {
  const response = await fetch(`${base}/products`, {
    headers: { Authorization: `Bearer ${api}` },
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 160) };
  }
  const list = Array.isArray(body) ? body : body.items || body.data || [];
  const ids = (Array.isArray(list) ? list : []).map((item) => item.product_id || item.id).filter(Boolean);
  console.log(label, response.status, ids.join(",") || JSON.stringify(body).slice(0, 180));
  console.log(`${label}_PLUS`, ids.includes(plus));
  console.log(`${label}_STUDIO`, ids.includes(studio));
}

if (api) {
  await probe("TEST", "https://test.dodopayments.com");
  await probe("LIVE", "https://live.dodopayments.com");
}

unlinkSync(path);
console.log("TEMP_DELETED");
