import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

// Exercise actual Data API RLS. A securely minted Editor session is supplied only
// at test runtime; no credentials are saved in the repository. Fixtures are removed.
const databaseAvailable = Boolean(process.env.PGHOST && process.env.BLOG_EDITOR_TEST_TOKEN);
describe.skipIf(!databaseAvailable)("Operations Editor blog permissions", () => {
  const postId = randomUUID();
  let categoryId: string;
  let results: Record<string, boolean> = {};
  function sql(query: string) {
    const run = spawnSync("psql", ["-X", "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1", "-c", query], { encoding: "utf8" });
    expect(run.status, run.stderr).toBe(0);
  }
  async function request(table: string, anonymous: boolean, method = "GET", body?: unknown) {
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const token = anonymous ? key : process.env.BLOG_EDITOR_TEST_TOKEN;
    if (!key || !token || !process.env.VITE_SUPABASE_URL) throw new Error("Missing test connection credentials");
    const filter = table === "blog_posts" ? `id=eq.${postId}` : `post_id=eq.${postId}`;
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/${table}${method === "POST" ? "" : `?${filter}`}`, {
      method,
      headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: body ? JSON.stringify(body) : undefined,
    });
    expect(response.status >= 200 && response.status < 300, `Data API ${table} ${method} status ${response.status}`).toBe(true);
    return response.json() as Promise<Array<Record<string, unknown>>>;
  }
  beforeAll(async () => {
    const category = spawnSync("psql", ["-X", "-q", "-t", "-A", "-c", "SELECT id FROM public.blog_categories ORDER BY id LIMIT 1"], { encoding: "utf8" });
    expect(category.status).toBe(0);
    categoryId = category.stdout.trim();
    expect(categoryId).toMatch(/^[0-9a-f-]{36}$/);
    sql(`
      INSERT INTO public.blog_posts(id,title,status,author_id)
        VALUES ('${postId}','Permission test','pending',
          (SELECT id FROM public.profiles WHERE role='admin' LIMIT 1));
      INSERT INTO public.blog_post_categories(post_id,category_id,is_primary)
        VALUES ('${postId}','${categoryId}',true);
    `);
    results.anonymous_pending_hidden = (await request("blog_posts", true)).length === 0;
    results.anonymous_pending_categories_hidden = (await request("blog_post_categories", true)).length === 0;
    results.editor_pending_visible = (await request("blog_posts", false)).length === 1;
    results.editor_categories_visible = (await request("blog_post_categories", false)).length === 1;
    const edited = await request("blog_posts", false, "PATCH", { title: "Cleaned up by Operations" });
    results.editor_can_edit = edited.length === 1 && edited[0]?.title === "Cleaned up by Operations";
    results.editor_can_remove_categories = (await request("blog_post_categories", false, "DELETE")).length === 1;
    results.editor_can_assign_categories = (await request("blog_post_categories", false, "POST", { post_id: postId, category_id: categoryId, is_primary: true })).length === 1;
    const published = await request("blog_posts", false, "PATCH", { status: "published" });
    results.editor_can_publish = published.length === 1 && published[0]?.status === "published";
    results.anonymous_published_visible = (await request("blog_posts", true)).length === 1;
  }, 30000);
  afterAll(async () => { await request("blog_posts", false, "DELETE"); });

  it("lets Operations review another author's pending posts", () => expect(results.editor_pending_visible).toBe(true));
  it("lets Operations clean up another author's content", () => expect(results.editor_can_edit).toBe(true));
  it("lets Operations read pending post categories", () => expect(results.editor_categories_visible).toBe(true));
  it("lets Operations remove existing post categories", () => expect(results.editor_can_remove_categories).toBe(true));
  it("lets Operations assign post categories", () => expect(results.editor_can_assign_categories).toBe(true));
  it("lets Operations mark reviewed posts published", () => expect(results.editor_can_publish).toBe(true));
  it("keeps pending posts private from visitors", () => expect(results.anonymous_pending_hidden).toBe(true));
  it("keeps pending category assignments private from visitors", () => expect(results.anonymous_pending_categories_hidden).toBe(true));
  it("makes published posts visible to visitors", () => expect(results.anonymous_published_visible).toBe(true));
});