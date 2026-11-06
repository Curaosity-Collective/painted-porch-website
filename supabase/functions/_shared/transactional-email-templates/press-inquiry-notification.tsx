import * as React from 'npm:react@18.3.1';
import { Html, Head, Preview, Body, Container, Heading, Text } from 'npm:@react-email/components@0.0.22';
import type { TemplateEntry } from './registry.ts';
import { PRESS_CONTACT } from '../press-inquiry.ts';
interface Props { firstName?: string; lastName?: string; email?: string; phone?: string; organization?: string; inquiryType?: string; message?: string; source?: string; }
const Email = (p: Props) => <Html lang="en"><Head /><Preview>New press inquiry from {p.firstName} {p.lastName}</Preview><Body style={main}><Container style={container}><Heading style={heading}>New Press & Speaking Inquiry</Heading><Text style={text}>Painted Porch Strategies | Media Relations</Text><Text style={text}>Name: {p.firstName} {p.lastName}<br />Email: {p.email}<br />Organization / publication: {p.organization}<br />Phone: {p.phone || 'Not provided'}<br />Inquiry: {p.inquiryType}<br />Source: {p.source}</Text><Text style={{ ...text, whiteSpace: 'pre-wrap' }}>{p.message}</Text></Container></Body></Html>;
export const template = { component: Email, subject: 'New Press & Speaking Inquiry | Painted Porch Strategies', to: PRESS_CONTACT.email, displayName: 'Press inquiry notification', previewData: { firstName: 'Marcus', lastName: 'Aurelius', email: 'marcus@example.com', organization: 'Example publication', inquiryType: 'Interview', message: 'An interview request.', source: '/press-kit' } } satisfies TemplateEntry;
const main = { backgroundColor: '#ffffff', fontFamily: 'Montserrat, Arial, sans-serif' };
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' };
const heading = { color: '#00006B', fontFamily: 'Poppins, Arial, sans-serif', fontSize: '24px' };
const text = { color: '#545454', fontSize: '15px', lineHeight: '1.6' };