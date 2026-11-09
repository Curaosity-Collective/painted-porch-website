import { pressContactFields } from '../_shared/press-inquiry.ts';
import { NEWSLETTER_TAG } from '../_shared/newsletter.ts';

export const ROADMAP_SOURCE = 'Painted Porch Strategies Website /change-roadmap';
export const ROADMAP_CONSENT = 'Yes, send me the occasional Painted Porch newsletter with tips and resources.';
export interface RoadmapInput { firstName: string; lastName: string; email: string; newsletter: boolean; }
type CRM = (path: string, method?: string, body?: unknown) => Promise<any>;

/** Append opt-in metadata to an email-matched contact, never overwrite identity or preferences. */
export async function saveRoadmapContact(ghl: CRM, locationId: string, input: RoadmapInput) {
  const receivedAt = new Date().toISOString();
  const tags = ['Change Roadmap', ...(input.newsletter ? [NEWSLETTER_TAG] : [])];
  const found = await ghl(`/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(input.email)}`);
  let contactId: string | undefined = found.contact?.id;
  if (contactId) {
    const full = await ghl(`/contacts/${contactId}`);
    await ghl(`/contacts/${contactId}`, 'PUT', { customFields: pressContactFields(full.contact?.customFields ?? []) });
    await ghl(`/contacts/${contactId}/tags`, 'POST', { tags });
  } else {
    const created = await ghl('/contacts/', 'POST', {
      locationId, firstName: input.firstName, lastName: input.lastName, email: input.email,
      tags, source: ROADMAP_SOURCE,
      customFields: [...pressContactFields(),
        { id: 'Jyw2gDBVh3Y0RsaXUpBd', field_value: 'New' },
        { id: 'A28bKAM3DFGCczH7ck28', field_value: 'Website Contact' },
        { id: '410RQnsoOeKEcmKVJw7i', field_value: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' }) },
      ],
    });
    contactId = created.contact?.id;
  }
  if (!contactId) throw new Error('Contact not saved');
  await ghl(`/contacts/${contactId}/notes`, 'POST', {
    body: `Resource: The P.A.T.H. Roadmap Planner\nBrand: Painted Porch Strategies\nSource: ${ROADMAP_SOURCE}\nReceived: ${receivedAt}\nSubmitted name: ${input.firstName} ${input.lastName}\nEmail: ${input.email}\nNewsletter checkbox: ${input.newsletter ? 'Checked' : 'Unchecked'}\nNewsletter consent text: ${ROADMAP_CONSENT}`,
  });
  return contactId;
}