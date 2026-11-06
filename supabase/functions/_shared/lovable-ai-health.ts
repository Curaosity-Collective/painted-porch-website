type HealthVerdict = { status: "pass" | "fail" | "warn"; detail: string };

export function classifyLovableAiCatalog(httpStatus: number, body: unknown): HealthVerdict {
  const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const error = payload.error && typeof payload.error === "object" ? payload.error as Record<string, unknown> : {};
  const message = typeof payload.message === "string" ? payload.message
    : typeof error.message === "string" ? error.message : "Lovable AI availability could not be verified.";
  if (httpStatus < 200 || httpStatus >= 300) return { status: "fail", detail: message };
  if (!Array.isArray(payload.data) || payload.data.length === 0) {
    return { status: "fail", detail: "Lovable AI returned no available models." };
  }
  if (typeof payload.workspace_models === "string" && payload.workspace_models.startsWith("public_only")) {
    return { status: "warn", detail: "Public AI catalog is reachable; workspace access remains unverified." };
  }
  return { status: "pass", detail: "Lovable AI credentials and workspace model catalog verified." };
}