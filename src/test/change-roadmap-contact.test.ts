import { describe, it, expect } from 'vitest';
import { saveRoadmapContact, ROADMAP_SOURCE, ROADMAP_CONSENT } from '../../supabase/functions/submit-change-roadmap-optin/contact';
import { PRESS_FIELDS } from '../../supabase/functions/_shared/press-inquiry';

describe('P.A.T.H. Roadmap Planner contacts', () => {
  it.each([false, true])('saves a real contact and no opportunity (existing: %s)', async existing => {
    const calls: Array<{ path: string; method: string; body: any }> = [];
    const ghl = async (path: string, method = 'GET', body?: unknown) => {
      calls.push({ path, method, body });
      if (path.includes('/search/duplicate')) return existing ? { contact: { id: 'saved-contact' } } : {};
      return { contact: { id: 'saved-contact', customFields: [] } };
    };
    expect(await saveRoadmapContact(ghl, 'pps', { firstName: 'Reader', lastName: '', email: 'reader@example.com', newsletter: true })).toBe('saved-contact');
    expect(calls.some(c => c.path.includes('opportunities'))).toBe(false);
    expect(calls.find(c => c.path.endsWith('/notes'))?.body.body).toContain('Resource: The P.A.T.H. Roadmap Planner');
    const write = calls.find(c => c.method === (existing ? 'PUT' : 'POST'));
    expect(write?.body.customFields).toContainEqual({ id: PRESS_FIELDS.contactBrand, field_value: ['Painted Porch Strategies'] });
    if (!existing) expect(write?.body).toMatchObject({ firstName: 'Reader', lastName: '', email: 'reader@example.com', source: ROADMAP_SOURCE });
  });

  it('preserves existing identity, first-touch brand, tags, source and DND', async () => {
    const writes: any[] = [];
    const ghl = async (path: string, method = 'GET', body?: unknown) => {
      if (method !== 'GET') writes.push({ path, method, body });
      return { contact: { id: 'existing', firstName: 'Original', source: 'Referral', dnd: true, tags: ['customer'], customFields: [
        { id: PRESS_FIELDS.contactBrand, value: ['Painted Porch Strategies'] },
        { id: PRESS_FIELDS.firstBrand, value: 'Painted Porch Strategies' },
      ] } };
    };
    await saveRoadmapContact(ghl, 'pps', { firstName: 'New name', lastName: 'Different', email: 'reader@example.com', newsletter: true });
    expect(writes.find(c => c.method === 'PUT')?.body).toEqual({ customFields: [{ id: PRESS_FIELDS.contactBrand, field_value: ['Painted Porch Strategies'] }] });
    expect(writes.find(c => c.path.endsWith('/tags'))?.body.tags).toEqual(['Change Roadmap', 'newsletter']);
  });

  it('records unchecked consent without adding newsletter or removing a prior subscription', async () => {
    const writes: any[] = [];
    const ghl = async (path: string, method = 'GET', body?: unknown) => {
      if (method !== 'GET') writes.push({ path, method, body });
      return { contact: { id: 'contact', customFields: [] } };
    };
    await saveRoadmapContact(ghl, 'pps', { firstName: 'Reader', lastName: '', email: 'reader@example.com', newsletter: false });
    expect(writes.find(c => c.path.endsWith('/tags'))?.body.tags).toEqual(['Change Roadmap']);
    expect(writes.find(c => c.path.endsWith('/notes'))?.body.body).toContain(`Newsletter checkbox: Unchecked\nNewsletter consent text: ${ROADMAP_CONSENT}`);
    expect(writes.some(c => c.method === 'DELETE')).toBe(false);
  });

  it('does not create a duplicate when the email lookup fails', async () => {
    const calls: string[] = [];
    await expect(saveRoadmapContact(async path => { calls.push(path); throw new Error('CRM unavailable'); }, 'pps', { firstName: 'Reader', lastName: '', email: 'reader@example.com', newsletter: true })).rejects.toThrow('CRM unavailable');
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain('/contacts/search/duplicate');
  });
});