import { describe, it, expect, vi } from 'vitest';
import { INQUIRY_RESPONSE_HOURS, inquiryReceiptData, queueInquiryReceipt } from '../../supabase/functions/_shared/inquiry-email';

describe('inquiry receipts', () => {
  it('sets a 24–48 business-hour response window', () => {
    expect(INQUIRY_RESPONSE_HOURS).toEqual({ min: 24, max: 48 });
  });
  it('keeps all submitted press details in the requester receipt', async () => {
    const input = { firstName: 'Marcus', lastName: 'Aurelius', email: 'reader@example.com', phone: '5551234567', organization: 'Publication', inquiryType: 'Interview', message: 'Our interview request\nWith a deadline', consent: true };
    const invoke = vi.fn().mockResolvedValue({ data: { success: true, queued: true }, error: null });
    expect(await queueInquiryReceipt({ functions: { invoke } }, 'test-key', input, 'press-event')).toBe('queued');
    expect(invoke).toHaveBeenCalledWith('send-transactional-email', {
      headers: { Authorization: 'Bearer test-key' },
      body: { templateName: 'contact-confirmation', recipientEmail: 'reader@example.com', idempotencyKey: 'inquiry-receipt-press-event', templateData: inquiryReceiptData(input) },
    });
    expect(inquiryReceiptData(input)).toMatchObject({ firstName: 'Marcus', lastName: 'Aurelius', email: 'reader@example.com', phone: '5551234567', inquiryType: 'Interview', message: 'Our interview request\nWith a deadline', company: 'Publication', consent: 'I agree to be contacted about this inquiry.' });
  });
  it('keeps contact scope, interests, budget, date and newsletter choice', () => {
    const details = { company: 'Organization', inquiryFor: ['Company'], interests: ['Speaking'], budgetAuthority: 'Yes', budgetRange: '$5,000-$7,999', timeline: 'Specific Date', specificDate: '2026-12-01', newsletter: false };
    expect(inquiryReceiptData(details)).toMatchObject(details);
  });
  it.each(['suppressed', 'failed'])('does not lose a saved inquiry when email is %s', async (status) => {
    const invoke = vi.fn().mockResolvedValue(status === 'suppressed' ? { data: { success: false, reason: 'email_suppressed' }, error: null } : { data: null, error: new Error('Queue unavailable') });
    expect(await queueInquiryReceipt({ functions: { invoke } }, 'test-key', { email: 'reader@example.com' }, 'event')).toBe(status);
  });
});