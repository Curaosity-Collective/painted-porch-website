export const NEWSLETTER_TAG = 'newsletter';
export const NEWSLETTER_LEGACY_TAGS = ['newsletter-opt-in', 'resources_subscriber'];
export const NEWSLETTER_CONSENT = 'Subscribe to receive our latest thinking on change-readiness, leadership development, and organizational transformation.';

// Keep unrelated and legacy tags on existing records until their workflows have migrated.
export function newsletterTags(existing: string[] = []) {
  return [...new Set([...existing, NEWSLETTER_TAG])];
}
