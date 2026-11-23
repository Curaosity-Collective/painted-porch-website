const PRIMARY_ORIGIN = "https://onthepaintedporch.com";

/** Canonicals identify the public page, never the preview or a secondary host. */
export function canonicalPageUrl(value: string) {
  const parsed = new URL(value, `${PRIMARY_ORIGIN}/`);
  const pathname = parsed.pathname.toLowerCase().replace(/\/+$/, "") || "/";
  return `${PRIMARY_ORIGIN}${pathname}`;
}