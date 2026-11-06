// A privileged callback must present the actual server credential, not merely
// a JWT claiming service_role or the public project key.
export function isScheduledScan(authorization: string | null, serviceKey: string | undefined): boolean {
  if (!serviceKey || !authorization?.startsWith("Bearer ")) return false;
  const supplied = authorization.slice(7);
  if (supplied.length !== serviceKey.length) return false;
  let difference = 0;
  for (let i = 0; i < serviceKey.length; i++) difference |= supplied.charCodeAt(i) ^ serviceKey.charCodeAt(i);
  return difference === 0;
}

export const WEEKLY_SCAN_SCHEDULE = "0 14 * * 1"; // Monday, 7am Phoenix.
export const NEWSLETTER_AUTHOR_ID = "863b981f-ce16-4913-8978-45e691da84ae";
export const SCANNED_VIDEO_STATUS = "pending";
export const SCANNED_ARTICLE_STATUS = "pending";