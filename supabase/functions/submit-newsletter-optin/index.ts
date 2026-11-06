import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { pressContactFields } from '../_shared/press-inquiry.ts';
import { NEWSLETTER_TAG, NEWSLETTER_PIPELINE, NEWSLETTER_CONSENT, newsletterOpportunity, isNewsletterOpportunity } from '../_shared/newsletter.ts';

const schema = z.object({ email: z.string().trim().email().max(255).transform(s => s.toLowerCase()), source: z.enum(['Footer Newsletter', 'Blog Newsletter', 'Free Resources Newsletter']).default('Free Resources Newsletter') });
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return response({ error: 'Method not allowed' }, 405);
  const origin = req.headers.get('origin');
  if (!origin || !/^https?:\/\/(localhost(?::\d+)?|(?:www\.)?(?:onthepaintedporch|paintedporchstrategies)\.com|[a-z0-9-]+\.(?:lovable\.app|lovableproject\.com))$/i.test(origin)) return response({ error: 'Please subscribe through our website.' }, 403);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return response({ error: 'Please enter a valid email and newsletter source.' }, 400);
  const { email, source } = parsed.data;
  try {
    const key = Deno.env.get('GHL_API_KEY'); const locationId = Deno.env.get('GHL_LOCATION_ID');
    if (!key || !locationId) throw new Error('Newsletter configuration unavailable');
    const headers = { Authorization: `Bearer ${key}`, Version: '2021-07-28', 'Content-Type': 'application/json' };
    async function ghl(path: string, method = 'GET', body?: unknown) {
      const r = await fetch(`https://services.leadconnectorhq.com${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
      if (!r.ok) { console.error('Newsletter CRM request failed', { status: r.status, path: path.split('?')[0] }); throw new Error('Unable to save newsletter signup'); }
      return r.json();
    }
    const receivedAt = new Date().toISOString();
    const found = await ghl(`/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`);
    let contactId: string | undefined = found.contact?.id;
    if (contactId) {
      const full = await ghl(`/contacts/${contactId}`);
      // Unsigned email submissions may append metadata, never replace identity, tags, source or DND preferences.
      await ghl(`/contacts/${contactId}`, 'PUT', { customFields: pressContactFields(full.contact?.customFields ?? []) });
      await ghl(`/contacts/${contactId}/tags`, 'POST', { tags: [NEWSLETTER_TAG] });
    } else {
      const created = await ghl('/contacts/', 'POST', { locationId, email, tags: [NEWSLETTER_TAG], source, customFields: [...pressContactFields(), { id: 'Jyw2gDBVh3Y0RsaXUpBd', field_value: 'New' }, { id: 'A28bKAM3DFGCczH7ck28', field_value: source }, { id: '410RQnsoOeKEcmKVJw7i', field_value: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' }) }] });
      contactId = created.contact?.id;
    }
    if (!contactId) throw new Error('Contact not saved');
    const existing = await ghl(`/opportunities/search?location_id=${encodeURIComponent(locationId)}&contact_id=${encodeURIComponent(contactId)}&pipeline_id=${NEWSLETTER_PIPELINE.id}&limit=100`);
    let opportunityId: string | undefined = existing.opportunities?.find(isNewsletterOpportunity)?.id;
    if (!opportunityId) {
      const created = await ghl('/opportunities/', 'POST', newsletterOpportunity(contactId, locationId, email, source, receivedAt));
      opportunityId = created.opportunity?.id;
    }
    if (!opportunityId) throw new Error('Newsletter lead not saved');
    await ghl(`/contacts/${contactId}/notes`, 'POST', { body: `Newsletter signup\nBrand: Painted Porch Strategies\nSource: ${source}\nReceived: ${receivedAt}\nConsent: ${NEWSLETTER_CONSENT}` });
    return response({ success: true });
  } catch { return response({ error: 'Your subscription could not be saved. Please try again.' }, 502); }
});
