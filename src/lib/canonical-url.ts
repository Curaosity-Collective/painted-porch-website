const PRIMARY_ORIGIN = "https://onthepaintedporch.com";

/** The real form of an address: lowercase, with no trailing slash ("/" stays "/"). */
export function canonicalPath(pathname: string) {
  return pathname.toLowerCase().replace(/\/+$/, "") || "/";
}

/** Canonicals identify the public page, never the preview or a secondary host. */
export function canonicalPageUrl(value: string) {
  const parsed = new URL(value, `${PRIMARY_ORIGIN}/`);
  return `${PRIMARY_ORIGIN}${canonicalPath(parsed.pathname)}`;
}