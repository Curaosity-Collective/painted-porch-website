import { loadEnv } from "vite";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Deliberate allowlist: private environment variables must never enter define.
const PUBLIC_CONNECTION_KEYS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PROJECT_ID",
];

export function publicBuildEnv(mode, directory = process.cwd()) {
  // Read the simple, unquoted public defaults independently of process.env:
  // loadEnv would let an explicitly empty hosting variable erase them too.
  const defaultsPath = join(directory, ".env.example");
  const defaults = Object.fromEntries(
    (existsSync(defaultsPath) ? readFileSync(defaultsPath, "utf8") : "")
      .split(/\r?\n/)
      .flatMap((line) => {
        const match = line.match(/^(VITE_SUPABASE_[A-Z_]+)=(.*)$/);
        return match ? [[match[1], match[2].trim()]] : [];
      }),
  );
  const configured = loadEnv(mode, directory, "VITE_SUPABASE_");
  return Object.fromEntries(PUBLIC_CONNECTION_KEYS.map((key) => [
    key,
    configured[key]?.trim() || defaults[key]?.trim() || "",
  ]));
}

export function publicBuildDefines(mode, directory = process.cwd()) {
  const env = publicBuildEnv(mode, directory);
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Public backend connection settings are missing. Restore .env.example or supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before building.");
  }
  return Object.fromEntries(Object.entries(env).map(([key, value]) => [
    `import.meta.env.${key}`, JSON.stringify(value),
  ]));
}