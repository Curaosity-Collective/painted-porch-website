import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { NEWSLETTER_TAG, newsletterTags, newsletterOpportunity, isNewsletterOpportunity } from '../../supabase/functions/_shared/newsletter';

describe('newsletter leads', () => {
  it('saves newsletter signups without sending a team email', async () => {
    const calls: string[] = [];
    let handler: ((req: Request) => Promise<Response>) | undefined;
    const source = readFileSync('supabase/functions/submit-newsletter-optin/index.ts', 'utf8')
      .replace(/^import .*;\n/gm, '')
      .replace(/^const schema = .*;$/m, "const schema = { safeParse: () => ({ success: true, data: { email: 'reader@example.com', source: 'Blog Newsletter' } }) };");
    runInNewContext(source, {
      Deno: { env: { get: (name: string) => ['GHL_API_KEY', 'GHL_LOCATION_ID'].includes(name) ? 'test-config' : undefined }, serve: (fn: typeof handler) => { handler = fn; } },
      Response, corsHeaders: {}, console, NEWSLETTER_TAG, NEWSLETTER_PIPELINE: { id: 'pipeline' },
      NEWSLETTER_CONSENT: 'Newsletter consent', newsletterOpportunity, isNewsletterOpportunity,
      pressContactFields: () => [],
      fetch: async (url: string) => {
        calls.push(url);
        const data = url.includes('/opportunities/search') ? { opportunities: [{ id: 'lead', name: 'Newsletter Signup: reader@example.com' }] } : { contact: { id: 'contact', customFields: [] } };
        return Response.json(data);
      },
    });
    if (!handler) throw new Error('Newsletter handler not registered');
    const result = await handler(new Request('https://example.com', { method: 'POST', headers: { origin: 'https://onthepaintedporch.com' }, body: '{}' }));
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ success: true });
    expect(calls.some(url => url.includes('/contacts/contact/notes'))).toBe(true);
    expect(calls.every(url => url.startsWith('https://services.leadconnectorhq.com/'))).toBe(true);
  });
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