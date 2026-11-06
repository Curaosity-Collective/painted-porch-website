import { describe, expect, it } from "vitest";
import { classifyLovableAiCatalog } from "../../supabase/functions/_shared/lovable-ai-health";

describe("Lovable AI availability checks", () => {
  it("passes an authenticated nonempty model catalog", () => {
    expect(classifyLovableAiCatalog(200, { data: [{ id: "available-model" }] }).status).toBe("pass");
  });
  it("does not treat insufficient credits as success", () => {
    expect(classifyLovableAiCatalog(402, { message: "Add credits" })).toEqual({ status: "fail", detail: "Add credits" });
  });
  it("preserves a safe terminal denial message", () => {
    expect(classifyLovableAiCatalog(403, { error: { message: "AI is disabled" } })).toEqual({ status: "fail", detail: "AI is disabled" });
  });
  it("does not claim workspace access for a public-only catalog", () => {
    expect(classifyLovableAiCatalog(200, { data: [{}], workspace_models: "public_only" }).status).toBe("warn");
  });
  it("rejects an empty catalog", () => {
    expect(classifyLovableAiCatalog(200, { data: [] }).status).toBe("fail");
  });
});