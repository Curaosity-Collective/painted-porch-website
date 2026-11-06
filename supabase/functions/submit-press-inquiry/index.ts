import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { PRESS_CONTACT, pressContactFields, pressOpportunity } from '../_shared/press-inquiry.ts';
const schema = z.object({ firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100), email: z.string().trim().email().max(255).transform(s => s.toLowerCase()), organization: z.string().trim().min(1).max(200), phone: z.string().trim().max(40).optional(), inquiryType: z.enum(['Interview', 'Speaking engagement', 'Press materials', 'Other']), message: z.string().trim().min(10).max(5000), consent: z.literal(true), source: z.enum(['/press-kit', '/press']), submissionId: z.string().uuid(), website: z.string().max(0).optional() });
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return response({ error: 'Method not allowed' }, 405);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return response({ error: 'Please check the inquiry fields.', fields: parsed.error.flatten().fieldErrors }, 400);
  const input = parsed.data;
  try {
    const key = Deno.env.get('GHL_API_KEY'); const locationId = Deno.env.get('GHL_LOCATION_ID');
    const url = Deno.env.get('SUPABASE_URL'); const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!key || !locationId || !url || !serviceKey) throw new Error('Press inquiry configuration unavailable');
    const headers = { Authorization: `Bearer ${key}`, Version: '2021-07-28', 'Content-Type': 'application/json' };
    async function ghl(path: string, method = 'GET', body?: unknown) {
      const r = await fetch(`https://services.leadconnectorhq.com${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
      if (!r.ok) { console.error('Press CRM request failed', { status: r.status, path: path.split('?')[0] }); throw new Error('Unable to save the press inquiry'); }
      return r.json();
    }
    const found = await ghl(`/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(input.email)}`);
    let contactId: string | undefined = found.contact?.id;
    if (contactId) {
      // An email on an unsigned form does not establish identity. Only add brand metadata and a new inquiry; never replace existing identity or tags.
      const full = await ghl(`/contacts/${contactId}`);
      await ghl(`/contacts/${contactId}`, 'PUT', { customFields: pressContactFields(full.contact?.customFields ?? []) });
    } else {
      const created = await ghl('/contacts/', 'POST', { locationId, firstName: input.firstName, lastName: input.lastName, email: input.email, companyName: input.organization, ...(input.phone ? { phone: input.phone } : {}), source: `Painted Porch Strategies Website ${input.source}`, customFields: pressContactFields() });
      contactId = created.contact?.id;
    }
    if (!contactId) throw new Error('Contact was not saved');
    const existing = await ghl(`/opportunities/search?location_id=${encodeURIComponent(locationId)}&contact_id=${encodeURIComponent(contactId)}&pipeline_id=OlrKwxPdDW6kSoecPB4k&limit=100`);
    let opportunityId: string | undefined = existing.opportunities?.find((o: { customFields?: Array<{ id?: string; fieldValue?: unknown; field_value?: unknown }> }) => o.customFields?.some(f => String(f.fieldValue ?? f.field_value ?? '').includes(`Submission: ${input.submissionId}`)))?.id;
    if (!opportunityId) {
      const created = await ghl('/opportunities/', 'POST', pressOpportunity(input, contactId, locationId, new Date().toISOString()));
      opportunityId = created.opportunity?.id;
    }
    if (!opportunityId) throw new Error('Opportunity was not saved');
    const client = createClient(url, serviceKey);
    const { data, error } = await client.functions.invoke('send-transactional-email', { headers: { Authorization: `Bearer ${serviceKey}` }, body: { templateName: 'press-inquiry-notification', recipientEmail: PRESS_CONTACT.email, idempotencyKey: `press-inquiry-${input.submissionId}`, templateData: input } });
    const emailQueued = !error && data?.success === true && data?.queued === true;
    if (!emailQueued) console.error('Press email not queued', { reason: data?.reason || 'handoff_failed' });
    return response({ success: true, emailQueued, submissionId: input.submissionId });
  } catch { return response({ error: 'Your inquiry could not be saved. Please try again.' }, 502); }
});