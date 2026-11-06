import { useRef, useState } from "react";
import { z } from "zod";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const schema = z.object({ firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100), email: z.string().trim().email().max(255), organization: z.string().trim().min(1).max(200), phone: z.string().trim().max(40), inquiryType: z.enum(["Interview", "Speaking engagement", "Press materials", "Other"]), message: z.string().trim().min(10).max(5000), consent: z.literal(true), website: z.string().max(0) });
export function PressInquiryForm({ source = "/press-kit" }: { source?: "/press-kit" | "/press" }) {
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", organization: "", phone: "", inquiryType: "", message: "", consent: false, website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false); const [failure, setFailure] = useState("");
  const submissionId = useRef(crypto.randomUUID());
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    const parsed = schema.safeParse(values);
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.path[0] === "consent" ? "Please agree to be contacted about this inquiry." : i.path[0] === "email" ? "Enter a valid email address." : i.path[0] === "message" ? "Please include at least 10 characters." : "Please complete this field."]))); return; }
    setErrors({}); setFailure(""); setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-press-inquiry", { body: { ...parsed.data, source, submissionId: submissionId.current } });
      if (error || data?.success !== true) throw new Error("Could not save inquiry");
      setSent(true);
    } catch { setFailure("Your inquiry could not be saved. Please try again."); } finally { setBusy(false); }
  }
  if (sent) return <div role="status" className="py-8"><CheckCircle className="w-8 h-8 text-lime mb-4" /><h3 className="font-poppins text-2xl font-semibold text-navy">Thank you for reaching out.</h3><p className="text-body mt-3">Your inquiry has been received by Media Relations.</p></div>;
  const fields = [{ key: "firstName", label: "First Name", placeholder: "Marcus", required: true, max: 100 }, { key: "lastName", label: "Last Name", placeholder: "Aurelius", required: true, max: 100 }, { key: "email", label: "Email Address", placeholder: "marcus@example.com", required: true, max: 255 }, { key: "phone", label: "Phone Number", placeholder: "(555) 867-5309", required: false, max: 40 }, { key: "organization", label: "Organization / Publication", placeholder: "Initech", required: true, max: 200 }] as const;
  return <form onSubmit={submit} noValidate aria-label="Press inquiry" className="space-y-6">
    <div className="grid gap-5 sm:grid-cols-2">{fields.map(f => <div key={f.key} className={f.key === "organization" ? "sm:col-span-2" : ""}><Label htmlFor={`press-${f.key}`}>{f.label}{f.required && " *"}</Label><Input id={`press-${f.key}`} value={values[f.key]} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} type={f.key === "email" ? "email" : f.key === "phone" ? "tel" : "text"} autoComplete={f.key === "email" ? "email" : f.key === "phone" ? "tel" : f.key === "firstName" ? "given-name" : f.key === "lastName" ? "family-name" : "organization"} maxLength={f.max} required={f.required} placeholder={f.placeholder} className={`mt-2 ${errors[f.key] ? "border-destructive" : ""}`} aria-invalid={!!errors[f.key]} aria-describedby={errors[f.key] ? `error-${f.key}` : undefined} />{errors[f.key] && <p id={`error-${f.key}`} className="text-caption text-destructive mt-2">{errors[f.key]}</p>}</div>)}</div>
    <div><Label htmlFor="press-type">Inquiry Type *</Label><Select value={values.inquiryType} onValueChange={inquiryType => setValues(v => ({ ...v, inquiryType }))}><SelectTrigger id="press-type" className={`mt-2 ${errors.inquiryType ? "border-destructive" : ""}`} aria-invalid={!!errors.inquiryType}><SelectValue placeholder="Select an inquiry type" /></SelectTrigger><SelectContent>{["Interview", "Speaking engagement", "Press materials", "Other"].map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select>{errors.inquiryType && <p className="text-caption text-destructive mt-2">{errors.inquiryType}</p>}</div>
    <div><Label htmlFor="press-message">Tell Us About Your Request *</Label><Textarea id="press-message" rows={6} maxLength={5000} value={values.message} onChange={e => setValues(v => ({ ...v, message: e.target.value }))} placeholder="Share your topic, audience, event date, or deadline." className={`mt-2 ${errors.message ? "border-destructive" : ""}`} aria-invalid={!!errors.message} />{errors.message && <p className="text-caption text-destructive mt-2">{errors.message}</p>}</div>
    <div className="hidden" aria-hidden="true"><label htmlFor="press-website">Website</label><input id="press-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={e => setValues(v => ({ ...v, website: e.target.value }))} /></div>
    <div><div className="flex items-start gap-3"><Checkbox id="press-consent" checked={values.consent} onCheckedChange={checked => setValues(v => ({ ...v, consent: checked === true }))} /><Label htmlFor="press-consent" className="leading-relaxed">I agree to be contacted about this inquiry.</Label></div>{errors.consent && <p className="text-caption text-destructive mt-2">{errors.consent}</p>}</div>
    {failure && <p role="alert" className="text-body-sm text-destructive">{failure}</p>}
    <Button type="submit" disabled={busy} className="gap-2">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{busy ? "Sending…" : "Send Inquiry"}</Button>
  </form>;
}