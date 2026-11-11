import { describe, it, expect } from 'vitest';
import { saveQuizContact, QUIZ_SOURCE, QUIZ_CONSENT } from '../../supabase/functions/submit-path-finder-quiz/contact';

const input = { firstName: 'Reader', email: 'Reader@example.com', subscribe: false, track: 'b2c' as const, resultType: 'RT-A', headline: 'Your next step', answers: { PQ1: 'A', Q2: ['B', 'C'] }, recommendations: [{ heading: 'Start Here', items: [{ name: 'Workshop', url: '/workshops', tier: 'Self-Led' }] }] };
describe('Emailed quiz results contacts', () => {
  it.each([false, true])('saves contact and result note without newsletter consent (existing: %s)', async existing => {
    const calls: any[] = [];
    await saveQuizContact(async (path, method = 'GET', body) => {
      calls.push({ path, method, body });
      if (path.includes('/search/duplicate')) return existing ? { contact: { id: 'one' } } : {};
      return { contact: { id: 'one', customFields: [] } };
    }, 'location', input);
    expect(calls.some(c => c.path.includes('opportunities'))).toBe(false);
    const tags = calls.find(c => c.path.endsWith('/tags'))?.body.tags ?? calls.find(c => c.path === '/contacts/')?.body.tags;
    expect(tags).toEqual(['PathQuiz', 'path-finder-RT-A', 'path-finder-b2c']);
    const note = calls.find(c => c.path.endsWith('/notes')).body.body;
    expect(note).toContain('RT-A - Your next step');
    expect(note).toContain('Q2: B, C');
    expect(note).toContain('Workshop (Self-Led) - /workshops');
    expect(note).toContain(`Newsletter checkbox: Unchecked\nNewsletter consent text: ${QUIZ_CONSENT}`);
    if (!existing) expect(calls.find(c => c.path === '/contacts/').body).toMatchObject({ email: 'reader@example.com', source: QUIZ_SOURCE });
  });
  it('preserves existing identity and preferences while adding opted-in newsletter tag', async () => {
    const writes: any[] = [];
    await saveQuizContact(async (path, method = 'GET', body) => {
      if (method !== 'GET') writes.push({ path, body });
      return { contact: { id: 'one', firstName: 'Original', dnd: true, customFields: [] } };
    }, 'location', { ...input, subscribe: true });
    expect(writes.find(c => c.path === '/contacts/one').body).toEqual({ customFields: expect.any(Array) });
    expect(writes.find(c => c.path.endsWith('/tags')).body.tags).toContain('newsletter');
    expect(writes.find(c => c.path.endsWith('/notes')).body.body).toContain('Newsletter checkbox: Checked');
  });
  it('never creates a duplicate after a failed email lookup', async () => {
    const paths: string[] = [];
    await expect(saveQuizContact(async path => { paths.push(path); throw new Error('Lookup failed'); }, 'location', input)).rejects.toThrow('Lookup failed');
    expect(paths).toHaveLength(1);
  });
  it('reports a failed note rather than claiming the results were saved', async () => {
    await expect(saveQuizContact(async path => {
      if (path.endsWith('/notes')) throw new Error('Note failed');
      return { contact: { id: 'one', customFields: [] } };
    }, 'location', input)).rejects.toThrow('Note failed');
  });
});