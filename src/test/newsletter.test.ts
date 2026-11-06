import { describe, it, expect } from 'vitest';
import { NEWSLETTER_TAG, newsletterTags, newsletterOpportunity, isNewsletterOpportunity } from '../../supabase/functions/_shared/newsletter';

describe('newsletter leads', () => {
  it('uses one canonical newsletter tag and preserves unrelated tags', () => {
    expect(NEWSLETTER_TAG).toBe('newsletter');
    expect(newsletterTags(['customer', 'newsletter'])).toEqual(['customer', 'newsletter']);
  });
  it('creates an open branded lead in the inbound lead stage', () => {
    const lead = newsletterOpportunity('contact', 'location', 'reader@example.com', 'Blog Newsletter', '2026-11-06T16:11:00Z');
    expect(lead.status).toBe('open');
    expect(lead.pipelineId).toBe('wN61Lguggu7DpJjtDXzM');
    expect(lead.pipelineStageId).toBe('246523a0-051a-4ae5-869d-3bb6fd6ce679');
    expect(lead.customFields[0].field_value).toBe('Painted Porch Strategies');
    expect(lead.source).toBe('Blog Newsletter');
  });
  it('only recognizes newsletter opportunities for reuse', () => {
    expect(isNewsletterOpportunity({ name: 'Newsletter Signup: reader@example.com' })).toBe(true);
    expect(isNewsletterOpportunity({ name: 'Press Inquiry: Example' })).toBe(false);
  });
});