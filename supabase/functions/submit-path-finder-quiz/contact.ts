import { pressContactFields } from '../_shared/press-inquiry.ts';
import { NEWSLETTER_TAG } from '../_shared/newsletter.ts';

export const QUIZ_SOURCE = 'Painted Porch Strategies Website Find Your Next ShIFt quiz';
export const QUIZ_CONSENT = 'Also subscribe me to updates on programs, resources, and insights.';
export interface QuizContactInput {
  firstName: string; email: string; subscribe: boolean; track: 'b2c' | 'b2b';
  resultType: string; headline: string; subhead?: string;
  answers: Record<string, string | string[]>;
  recommendations: Array<{ heading: string; items: Array<{ name: string; url: string; tier: string }> }>;
  strongestNextStep?: { name: string; url: string; label: string } | null;
}
type CRM = (path: string, method?: string, body?: unknown) => Promise<any>;

export function buildQuizNote(b: QuizContactInput) {
  return [
    `Find Your Next ShIFt quiz results`, `Brand: Painted Porch Strategies`,
    `Source: ${QUIZ_SOURCE}`, `Received: ${new Date().toISOString()}`,
    `Submitted name: ${b.firstName}`, `Email: ${b.email}`,
    `Newsletter checkbox: ${b.subscribe ? 'Checked' : 'Unchecked'}`,
    `Newsletter consent text: ${QUIZ_CONSENT}`,
    `Track: ${b.track.toUpperCase()} | Result: ${b.resultType} - ${b.headline}`,
    b.subhead || '',
    b.strongestNextStep ? `Strongest Next Step: ${b.strongestNextStep.name} (${b.strongestNextStep.url})` : '',
    'ANSWERS', ...Object.entries(b.answers).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`),
    'RECOMMENDATIONS', ...b.recommendations.flatMap(g => [g.heading, ...g.items.map(i => `${i.name} (${i.tier}) - ${i.url}`)]),
  ].filter(Boolean).join('\n');
}

export async function saveQuizContact(ghl: CRM, locationId: string, b: QuizContactInput) {
  const email = b.email.trim().toLowerCase();
  const tags = ['PathQuiz', `path-finder-${b.resultType}`, `path-finder-${b.track}`, ...(b.subscribe ? [NEWSLETTER_TAG] : [])];
  const found = await ghl(`/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`);
  let contactId: string | undefined = found.contact?.id;
  if (contactId) {
    const full = await ghl(`/contacts/${contactId}`);
    await ghl(`/contacts/${contactId}`, 'PUT', { customFields: pressContactFields(full.contact?.customFields ?? []) });
    await ghl(`/contacts/${contactId}/tags`, 'POST', { tags });
  } else {
    const created = await ghl('/contacts/', 'POST', {
      locationId, firstName: b.firstName.trim(), email, tags, source: QUIZ_SOURCE,
      customFields: pressContactFields(),
    });
    contactId = created.contact?.id;
  }
  if (!contactId) throw new Error('Quiz contact not saved');
  await ghl(`/contacts/${contactId}/notes`, 'POST', { body: buildQuizNote({ ...b, email }) });
  return contactId;
}