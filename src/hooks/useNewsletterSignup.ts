import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NewsletterStatus = "idle" | "loading" | "success" | "error";

/**
 * Porch Perspectives newsletter signup, shared by today's footer and the
 * redesign's footer. Posts to the existing `submit-newsletter-optin` edge
 * function (no new integration); `source` records which form was used.
 */
export function useNewsletterSignup(source: string) {
  const [email, setEmailState] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const [message, setMessage] = useState("");

  const setEmail = (value: string) => {
    setEmailState(value);
    if (status === "error") setStatus("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const { data, error } = await supabase.functions.invoke("submit-newsletter-optin", {
        body: { email: trimmed, source },
      });
      if (error) throw error;
      if (data?.success !== true) throw new Error("Subscription was not saved");
      setStatus("success");
      setMessage("You're on the list! Thanks for subscribing.");
      setEmailState("");
    } catch (err) {
      console.error("Newsletter signup error:", err);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return { email, setEmail, status, message, submit };
}
