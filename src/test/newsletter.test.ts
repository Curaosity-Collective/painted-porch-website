// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { transformSync } from 'esbuild';
import { NEWSLETTER_TAG, newsletterTags } from '../../supabase/functions/_shared/newsletter';

describe('newsletter contacts', () => {
  it.each([true, false])('saves a contact without lead creation or team email (existing: %s)', async (existing) => {
    const calls: string[] = [];
    let handler: ((req: Request) => Promise<Response>) | undefined;
    const source = readFileSync('supabase/functions/submit-newsletter-optin/index.ts', 'utf8')
      .replace(/^import .*;\n/gm, '')
      .replace(/^const schema = .*;$/m, "const schema = { safeParse: () => ({ success: true, data: { email: 'reader@example.com', source: 'Blog Newsletter' } }) };");
    runInNewContext(transformSync(source, { loader: 'ts', format: 'cjs' }).code, {
      Deno: { env: { get: (name: string) => ['GHL_API_KEY', 'GHL_LOCATION_ID'].includes(name) ? 'test-config' : undefined }, serve: (fn: typeof handler) => { handler = fn; } },
      Response, corsHeaders: {}, console, NEWSLETTER_TAG,
      NEWSLETTER_CONSENT: 'Newsletter consent',
      pressContactFields: () => [],
      fetch: async (url: string) => {
        calls.push(url);
        const data = !existing && url.includes('/contacts/search/duplicate') ? {} : { contact: { id: 'contact', customFields: [] } };
        return Response.json(data);
      },
    });
    if (!handler) throw new Error('Newsletter handler not registered');
    const result = await handler(new Request('https://example.com', { method: 'POST', headers: { origin: 'https://onthepaintedporch.com' }, body: '{}' }));
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ success: true });
    expect(calls.some(url => url.includes('/contacts/contact/notes'))).toBe(true);
    expect(calls.every(url => url.startsWith('https://services.leadconnectorhq.com/'))).toBe(true);
    expect(calls.some(url => url.includes('/opportunities'))).toBe(false);
    expect(calls.some(url => url.endsWith(existing ? '/contacts/contact/tags' : '/contacts/'))).toBe(true);
  });
  it('uses one canonical newsletter tag and preserves unrelated tags', () => {
    expect(NEWSLETTER_TAG).toBe('newsletter');
    expect(newsletterTags(['customer', 'newsletter'])).toEqual(['customer', 'newsletter']);
  });
});