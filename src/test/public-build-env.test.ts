import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

// Vite/esbuild must run in Node, not the jsdom realm used by UI tests.
const helperUrl = pathToFileURL(join(process.cwd(), "scripts/lib/public-build-env.mjs")).href;
const viteUrl = pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")).href;
const clientUrl = pathToFileURL(join(process.cwd(), "node_modules/@supabase/supabase-js/dist/index.mjs")).href;
const configPath = join(process.cwd(), "vite.config.ts");
function run(directory: string, expression: string) {
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", `
    import { publicBuildEnv, publicBuildDefines } from ${JSON.stringify(helperUrl)};
    ${expression}
  `], { cwd: directory, env: process.env, encoding: "utf8", timeout: 30000 });
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout);
}
function publicBuildEnv(mode: string, directory: string): Record<string, string> {
  return run(directory, `console.log(JSON.stringify(publicBuildEnv(${JSON.stringify(mode)})));`);
}

describe("repository builds retain public backend settings without .env", () => {
  let directory: string;
  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "pps-public-env-"));
    copyFileSync(join(process.cwd(), ".env.example"), join(directory, ".env.example"));
    for (const key of ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PROJECT_ID"]) {
      vi.stubEnv(key, "");
    }
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    rmSync(directory, { recursive: true, force: true });
  });

  it("supplies the verified connection in production and development with no .env", () => {
    for (const mode of ["production", "development"]) {
      const env = publicBuildEnv(mode, directory);
      expect(env.VITE_SUPABASE_URL).toBe("https://dkpxjivoupqpmvzwxpef.supabase.co");
      expect(env.VITE_SUPABASE_PROJECT_ID).toBe("dkpxjivoupqpmvzwxpef");
      const payload = JSON.parse(Buffer.from(env.VITE_SUPABASE_PUBLISHABLE_KEY.split(".")[1], "base64url").toString());
      expect(payload.role).toBe("anon");
      expect(payload.ref).toBe(env.VITE_SUPABASE_PROJECT_ID);
      expect(run(directory, `
        import { createClient } from ${JSON.stringify(clientUrl)};
        const env = publicBuildEnv(${JSON.stringify(mode)});
        const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        console.log(JSON.stringify(Boolean(client)));
      `)).toBe(true);
      expect(new URL(`${env.VITE_SUPABASE_URL}/functions/v1/submit-burnout-optin`).hostname)
        .toBe("dkpxjivoupqpmvzwxpef.supabase.co");
    }
  });

  it("uses defaults when a copied .env has blank values", () => {
    writeFileSync(join(directory, ".env"), "VITE_SUPABASE_URL=\nVITE_SUPABASE_PUBLISHABLE_KEY=\n");
    expect(publicBuildEnv("production", directory).VITE_SUPABASE_URL)
      .toBe("https://dkpxjivoupqpmvzwxpef.supabase.co");
  });

  it("respects nonempty mode-specific and hosting settings", () => {
    vi.stubEnv("VITE_SUPABASE_URL", undefined);
    writeFileSync(join(directory, ".env.production"), "VITE_SUPABASE_URL=https://local.example.com\n");
    expect(publicBuildEnv("production", directory).VITE_SUPABASE_URL).toBe("https://local.example.com");
    vi.stubEnv("VITE_SUPABASE_URL", "https://hosting.example.com");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_hosting");
    expect(publicBuildEnv("production", directory)).toMatchObject({
      VITE_SUPABASE_URL: "https://hosting.example.com",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_hosting",
    });
  });

  it("wires the fallback into every app import.meta.env reference, without private keys", () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "private-test-value");
    const define = run(directory, `
      import { loadConfigFromFile } from ${JSON.stringify(viteUrl)};
      const loaded = await loadConfigFromFile({ command: 'build', mode: 'production' }, ${JSON.stringify(configPath)});
      console.log(JSON.stringify(loaded.config.define));
    `);
    expect(define["import.meta.env.VITE_SUPABASE_URL"]).toBe(JSON.stringify("https://dkpxjivoupqpmvzwxpef.supabase.co"));
    expect(Object.keys(define)).toEqual([
      "import.meta.env.VITE_SUPABASE_URL",
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY",
      "import.meta.env.VITE_SUPABASE_PROJECT_ID",
    ]);
    expect(JSON.stringify(define)).not.toContain("private-test-value");
  });

  it("fails before deployment rather than emitting a crashing app if all configuration is absent", () => {
    rmSync(join(directory, ".env.example"));
    expect(run(directory, `
      try { publicBuildDefines('production'); console.log(JSON.stringify('unexpected success')); }
      catch (error) { console.log(JSON.stringify(error.message)); }
    `)).toContain("connection settings are missing");
  });
});