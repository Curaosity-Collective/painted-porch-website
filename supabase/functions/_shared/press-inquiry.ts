export const PRESS_CONTACT = { name: "Media Relations", email: "speaking@onthepaintedporch.com" };
export const PRESS_PIPELINE = { id: "OlrKwxPdDW6kSoecPB4k", stageId: "c68666eb-028d-4e13-aa3f-2f495ded7a62" };
export const PRESS_BRAND = "Painted Porch Strategies";
export const PRESS_FIELDS = { contactBrand: "EuXdMz2iw1kPhIWHXWF4", firstBrand: "GqXkpvJmvDaduFaLFQPa", opportunityBrand: "QhyYfuuhN8nRZiRt6ZWk", details: "3lAZNhCgAiv3Yt95f2ed", type: "4bW0BosVuYgBjkLwpV75" };

export interface PressInput { firstName: string; lastName: string; email: string; organization: string; phone?: string; inquiryType: string; message: string; consent: true; source: "/press-kit" | "/press"; submissionId: string; }

export function pressContactFields(existing: Array<{ id?: string; value?: unknown }> = []) {
  const has = (id: string) => existing.find((field) => field.id === id)?.value;
  const oldBrands = has(PRESS_FIELDS.contactBrand);
  const brands = Array.isArray(oldBrands) ? oldBrands : typeof oldBrands === "string" && oldBrands ? [oldBrands] : [];
  const fields: Array<{ id: string; field_value: string | unknown[] }> = [{ id: PRESS_FIELDS.contactBrand, field_value: [...new Set([...brands, PRESS_BRAND])] }];
  if (!has(PRESS_FIELDS.firstBrand)) fields.push({ id: PRESS_FIELDS.firstBrand, field_value: PRESS_BRAND });
  return fields;
}

export function pressOpportunity(input: PressInput, contactId: string, locationId: string, receivedAt: string) {
  return { locationId, contactId, pipelineId: PRESS_PIPELINE.id, pipelineStageId: PRESS_PIPELINE.stageId, status: "open", name: `Press Inquiry: ${input.organization} | ${input.firstName} ${input.lastName}`, source: `Painted Porch Strategies Website ${input.source}`, customFields: [
    { id: PRESS_FIELDS.opportunityBrand, field_value: PRESS_BRAND },
    { id: PRESS_FIELDS.type, field_value: ["Speaking/Workshop"] },
    { id: PRESS_FIELDS.details, field_value: `Inquiry: ${input.inquiryType}\nEmail: ${input.email}\nPhone: ${input.phone || "Not provided"}\nSource: ${input.source}\nReceived: ${receivedAt}\nConsent: I agree to be contacted about this inquiry.\nSubmission: ${input.submissionId}\n\n${input.message}` },
  ] };
}