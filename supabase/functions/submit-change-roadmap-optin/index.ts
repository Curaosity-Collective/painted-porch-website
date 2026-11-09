import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { saveRoadmapContact } from './contact.ts';
import { queueResourceEmail } from '../_shared/resource-email.ts';

const schema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).default(''),
  email: z.string().trim().email().max(255).transform(s => s.toLowerCase()),
  newsletter: z.boolean(),
});
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return response({ error: 'Method not allowed' }, 405);
  const origin = req.headers.get('origin');
  if (!origin || !/^https?:\/\/(localhost(?::\d+)?|(?:www\.)?(?:onthepaintedporch|paintedporchstrategies)\.com|[a-z0-9-]+\.(?:lovable\.app|lovableproject\.com))$/i.test(origin)) return response({ error: 'Please request the planner through our website.' }, 403);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return response({ error: 'Please check your name, email and newsletter selection.' }, 400);
  try {
    const key = Deno.env.get('GHL_API_KEY');
    const locationId = Deno.env.get('GHL_LOCATION_ID');
    if (!key || !locationId) throw new Error('Planner configuration unavailable');
    const headers = { Authorization: `Bearer ${key}`, Version: '2021-07-28', 'Content-Type': 'application/json' };
    async function ghl(path: string, method = 'GET', body?: unknown) {
      const result = await fetch(`https://services.leadconnectorhq.com${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
      if (!result.ok) {
        const details = await result.text();
        console.error('Planner CRM request failed', { status: result.status, path: path.split('?')[0], details });
        throw new Error('Unable to save planner signup');
      }
      return result.json();
    }
    await saveRoadmapContact(ghl, locationId, parsed.data);
    let delivery: { emailStatus: string } = { emailStatus: 'failed' };
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (url && serviceKey) delivery = await queueResourceEmail(createClient(url, serviceKey), {
      templateName: 'change-readiness-roadmap', recipientEmail: parsed.data.email,
      idempotencyKey: `change-roadmap-${crypto.randomUUID()}`,
      templateData: { firstName: parsed.data.firstName },
    });
    return response({ success: true, ...delivery });
  } catch (error) {
    console.error('Planner signup failed', error);
    return response({ error: 'Your planner request could not be saved. Please try again.' }, 502);
  }
});