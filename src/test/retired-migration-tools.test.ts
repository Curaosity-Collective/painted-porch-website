import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The May 2026 move tools were retired on 2026-11-25. PPS Admin, approving the
 * removal: "Yes, remove them in one PR". Their addresses forward to the page that
 * replaced each one, and the raw-SQL runner they relied on is dropped.
 */
const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

const RETIRED_PAGES = [
  "MigrateManager",
  "RestoreWizard",
  "IntegrityCheck",
  "SecretsHandoff",
  "MigrationChecklist",
];

describe("retired migration tools", () => {
  it("the page files and edge functions are gone", () => {
    for (const page of RETIRED_PAGES) {
      expect(existsSync(resolve(root, `src/pages/pps/admin/${page}.tsx`)), page).toBe(false);
    }
    for (const fn of ["migrate-import", "migrate-export"]) {
      expect(existsSync(resolve(root, `supabase/functions/${fn}`)), fn).toBe(false);
    }
  });

  it("old addresses forward instead of rendering a page", () => {
    const app = read("src/App.tsx");
    const forwards: Record<string, string> = {
      "secrets-handoff": "/admin/integrations",
      migrate: "/admin/backups",
      restore: "/admin/backups",
      verify: "/admin/backups",
      "migration-checklist": "/admin/backups",
    };
    for (const [path, target] of Object.entries(forwards)) {
      expect(app).toContain(
        `<Route path="${path}" element={<Navigate to="${target}" replace />} />`,
      );
    }
    for (const page of RETIRED_PAGES) {
      expect(app).not.toContain(`<${page} />`);
    }
  });

  it("the admin menu and dashboard no longer link to them", () => {
    const sidebar = read("src/components/pps/admin/AdminSidebar.tsx");
    const dashboard = read("src/pages/pps/admin/AdminDashboard.tsx");
    for (const path of ["/admin/migrate", "/admin/restore", "/admin/verify", "/admin/secrets-handoff", "/admin/migration-checklist"]) {
      expect(sidebar).not.toContain(`"${path}"`);
      expect(dashboard).not.toContain(`"${path}"`);
    }
    expect(sidebar).toContain('url: "/admin/integrations"');
  });

  it("Integration Health is admin-only in the menu and by address", () => {
    const sidebar = read("src/components/pps/admin/AdminSidebar.tsx");
    const sections = read("src/hooks/useAdminSections.ts");
    expect(sidebar).toContain('item.url === "/admin/integrations" && role !== "admin"');
    expect(sections).toContain('"/admin/integrations"');
  });

  it("no edge function calls the dropped admin_apply_sql", () => {
    const fnRoot = resolve(root, "supabase/functions");
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = resolve(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(entry.name) && readFileSync(p, "utf8").includes("admin_apply_sql")) {
          hits.push(p);
        }
      }
    };
    walk(fnRoot);
    expect(hits).toEqual([]);
    expect(read("supabase/migrations/20261125230000_retire_migration_sql_runner.sql")).toContain(
      "DROP FUNCTION IF EXISTS public.admin_apply_sql(text);",
    );
  });
});
