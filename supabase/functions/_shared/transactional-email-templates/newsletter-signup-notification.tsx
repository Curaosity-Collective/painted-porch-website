import * as React from 'npm:react@18.3.1';
import { Html, Head, Preview, Body, Container, Heading, Text } from 'npm:@react-email/components@0.0.22';
import type { TemplateEntry } from './registry.ts';
import { NEWSLETTER_INBOX } from '../newsletter.ts';
interface Props { email?: string; source?: string; receivedAt?: string; consent?: string; }
const Email = (p: Props) => <Html lang="en"><Head /><Preview>New Porch Perspectives newsletter lead</Preview><Body style={main}><Container style={container}><Heading style={heading}>New Newsletter Signup</Heading><Text style={text}>Painted Porch Strategies | Porch Perspectives</Text><Text style={text}>Email: {p.email}<br />Source: {p.source}<br />Received: {p.receivedAt}</Text><Text style={text}>A newsletter lead has been saved in the New Lead/Inquiry pipeline.</Text><Text style={text}>Consent: {p.consent}</Text></Container></Body></Html>;
export const template = { component: Email, subject: 'New Newsletter Signup | Painted Porch Strategies', to: NEWSLETTER_INBOX, displayName: 'Newsletter signup notification', previewData: { email: 'subscriber@example.com', source: 'Blog Newsletter', receivedAt: '2026-11-06', consent: 'Subscribe to Porch Perspectives.' } } satisfies TemplateEntry;
const main = { backgroundColor: '#ffffff', fontFamily: 'Montserrat, Arial, sans-serif' };
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' };
const heading = { color: '#00006B', fontFamily: 'Poppins, Arial, sans-serif', fontSize: '24px' };
const text = { color: '#545454', fontSize: '15px', lineHeight: '1.6' };