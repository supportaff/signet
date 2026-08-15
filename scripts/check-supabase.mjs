import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/g, "")];
    }),
);

const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
  auth: { persistSession: false },
});

const { error } = await supabase.from("signet_users").select("auth_id").limit(1);
if (error) {
  console.log("TABLE_STATUS", error.code, error.message);
} else {
  console.log("TABLE_OK");
}
