export const NEWSLETTER_TAG = 'newsletter';
export const NEWSLETTER_LEGACY_TAGS = ['newsletter-opt-in', 'resources_subscriber'];
export const NEWSLETTER_PIPELINE = { id: 'wN61Lguggu7DpJjtDXzM', stageId: '246523a0-051a-4ae5-869d-3bb6fd6ce679' };
export const NEWSLETTER_INBOX = 'team@onthepaintedporch.com';
export const NEWSLETTER_CONSENT = 'Subscribe to receive our latest thinking on change-readiness, leadership development, and organizational transformation.';

// Keep unrelated and legacy tags on existing records until their workflows have migrated.
export function newsletterTags(existing: string[] = []) {
  return [...new Set([...existing, NEWSLETTER_TAG])];
}

export function newsletterOpportunity(contactId: string, locationId: string, email: string, source: string, receivedAt: string) {
  return { locationId, contactId, pipelineId: NEWSLETTER_PIPELINE.id, pipelineStageId: NEWSLETTER_PIPELINE.stageId, status: 'open', name: `Newsletter Signup: ${email}`, source,
    customFields: [
      { id: 'QhyYfuuhN8nRZiRt6ZWk', field_value: 'Painted Porch Strategies' },
      { id: '3lAZNhCgAiv3Yt95f2ed', field_value: `Brand: Painted Porch Strategies\nSource: ${source}\nReceived: ${receivedAt}\nConsent: ${NEWSLETTER_CONSENT}` },
    ],
  };
}

export function isNewsletterOpportunity(opportunity: { name?: string }) {
  return opportunity.name?.startsWith('Newsletter Signup: ') === true;
}