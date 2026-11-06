export const INQUIRY_RESPONSE_HOURS = { min: 24, max: 48 };

interface EmailClient {
  functions: { invoke: (name: string, options: { body: Record<string, unknown>; headers: Record<string, string> }) => Promise<{ data: any; error: any }> };
}

export function inquiryReceiptData(input: Record<string, any>) {
  return {
    firstName: input.firstName, lastName: input.lastName, email: input.email,
    phone: input.phone, company: input.organization ?? input.company,
    inquiryType: input.inquiryType, inquiryFor: input.inquiryFor, interests: input.interests,
    message: input.message, budgetAuthority: input.budgetAuthority, budgetRange: input.budgetRange,
    timeline: input.timeline, specificDate: input.specificDate, newsletter: input.newsletter,
    consent: input.consent === true ? 'I agree to be contacted about this inquiry.' : undefined,
  };
}

// A saved inquiry stays saved even when delivery is suppressed or unavailable.
export async function queueInquiryReceipt(client: EmailClient, serviceKey: string, input: Record<string, any>, eventId: string) {
  try {
    const { data, error } = await client.functions.invoke('send-transactional-email', {
      headers: { Authorization: `Bearer ${serviceKey}` },
      body: { templateName: 'contact-confirmation', recipientEmail: input.email,
        idempotencyKey: `inquiry-receipt-${eventId}`, templateData: inquiryReceiptData(input) },
    });
    if (data?.reason === 'email_suppressed') return 'suppressed';
    if (!error && data?.success === true && data?.queued === true) return 'queued';
    console.error('Inquiry receipt not queued');
  } catch { console.error('Inquiry receipt handoff failed'); }
  return 'failed';
}