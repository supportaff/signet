import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const API = "https://api.supabase.com/v1";
const PROJECT_NAME = "signet";
const REGION = process.env.SUPABASE_REGION || "ap-south-1";
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function api(path, init = {}) {
  const response = await fetch(`${API}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const message = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`${init.method || "GET"} ${path} ${response.status}: ${message}`);
  }
  return body;
}

function setEnv(raw, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(raw)) return raw.replace(re, line);
  return `${raw.replace(/\s*$/, "")}\n${line}\n`;
}

const orgs = await api("/organizations");
if (!Array.isArray(orgs) || !orgs.length) {
  throw new Error("No Supabase organizations on this token.");
}
const org = orgs[0];
console.log("ORG", org.name, org.slug);

const projects = await api("/projects");
let project = Array.isArray(projects)
  ? projects.find((item) => item.name?.toLowerCase() === PROJECT_NAME)
  : null;

const dbPass = process.env.SUPABASE_DB_PASSWORD || `Signet_${randomBytes(12).toString("base64url")}!a1`;

if (!project) {
  console.log("CREATE", PROJECT_NAME);
  project = await api("/projects", {
    method: "POST",
    body: JSON.stringify({
      name: PROJECT_NAME,
      organization_slug: org.slug,
      db_pass: dbPass,
      region_selection: { type: "specific", code: REGION },
    }),
  });
} else {
  console.log("EXISTS", project.ref, project.status);
}

const ref = project.ref || project.id;
console.log("PROJECT", ref, project.status || "created");

for (let i = 0; i < 40; i += 1) {
  const current = await api(`/projects/${ref}`);
  console.log("STATUS", current.status);
  if (current.status === "ACTIVE_HEALTHY") {
    project = current;
    break;
  }
  if (i === 39) throw new Error(`Project did not become healthy: ${current.status}`);
  await new Promise((resolve) => setTimeout(resolve, 15000));
}

const keys = await api(`/projects/${ref}/api-keys`);
const service = keys.find((key) => key.name === "service_role" || key.id === "service_role");
const anon = keys.find((key) => key.name === "anon" || key.id === "anon");
if (!service?.api_key) throw new Error("No service_role key returned.");

const url = `https://${ref}.supabase.co`;
const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
await api(`/projects/${ref}/database/query`, {
  method: "POST",
  body: JSON.stringify({ query: schema }),
});
console.log("SCHEMA_OK");

let env = readFileSync(".env.local", "utf8");
env = setEnv(env, "NEXT_PUBLIC_SUPABASE_URL", url);
env = setEnv(env, "SUPABASE_SERVICE_ROLE_KEY", service.api_key);
if (anon?.api_key) env = setEnv(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY", anon.api_key);
env = setEnv(env, "SUPABASE_DB_PASSWORD", dbPass);
writeFileSync(".env.local", env.endsWith("\n") ? env : `${env}\n`);
console.log("ENV_UPDATED", url);
console.log("OLD_PROJECT_UNTOUCHED yrolqptdvlhmcfipcklp");
