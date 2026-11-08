import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Map, Compass, CheckCircle2, Sparkles } from "lucide-react";
import roadmapPreview from "@/assets/path-roadmap-planner-preview.png";
import heroBg from "@/assets/change-roadmap-hero-bg.png";

export default function ChangeRoadmapSignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast({ title: "Missing info", description: "Please add your name and email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const cleanFirst = firstName.trim();
      const cleanLast = lastName.trim();
      const cleanEmail = email.trim();

      const { error } = await supabase.functions.invoke("submit-ghl-lead", {
        body: {
          firstName: cleanFirst,
          lastName: cleanLast || "Unknown",
          email: cleanEmail,
          newsletter,
          tags: ["Change Roadmap"],
          message: "Requested the Change Readiness Roadmap worksheet",
        },
      });
      if (error) throw error;

      try {
        const idempotencyKey = `change-roadmap-${cleanEmail.toLowerCase()}-${Date.now()}`;
        const emailRes = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "change-readiness-roadmap",
            recipientEmail: cleanEmail,
            idempotencyKey,
            templateData: { firstName: cleanFirst },
          },
        });
        if (emailRes.error) {
          console.error("Change Roadmap email send failed:", emailRes.error);
        }
      } catch (sendErr) {
        console.error("Change Roadmap email exception:", sendErr);
      }

      navigate("/thank-you-change-roadmap");
    } catch (err) {
      console.error(err);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative text-white py-20 px-4 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/80 to-teal/80" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            FREE ROADMAP PLANNER
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-6 break-words">
            Your <span className="text-gold">P.A.T.H. Roadmap</span> Planner
          </h1>
          <p className="text-body text-white/90 max-w-3xl mx-auto">
            Ten stops, ten honest questions, and a checklist to keep your route in view, before your next big change kicks off.
          </p>
        </div>
      </section>

      {/* Content + Form */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: What you get */}
          <div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-poppins font-bold text-navy mb-4" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
              Most change doesn't fail at the finish line. It fails on the road.
            </h2>
            <p className="text-body text-charcoal mb-6">
              The P.A.T.H. Roadmap Planner treats change as a journey you prepare for, travel together, and keep traveling. Use it before your next initiative kicks off, so your sponsors, leaders, teams, and clients know where you're going, how you'll get there, and who keeps it alive once the project team moves on.
            </p>

            {/* Worksheet preview */}
            <a
              href="/downloads/The_PATH_Roadmap_Planner_Painted_Porch_Strategies.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-8 rounded overflow-hidden border-2 border-border shadow-md hover:shadow-xl transition-shadow bg-white"
              aria-label="Preview The P.A.T.H. Roadmap Planner"
            >
              <img
                src={roadmapPreview}
                alt="Preview of The P.A.T.H. Roadmap Planner worksheet"
                className="w-full h-auto block"
                loading="lazy"
              />
            </a>

            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-4">What's inside:</h3>
            <ul className="space-y-4">
              <li className="text-body flex gap-3">
                <Compass className="w-6 h-6 text-teal flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">Ten honest questions</strong> to capture first thoughts, one for each stop on the P.A.T.H.
                </span>
              </li>
              <li className="text-body flex gap-3">
                <Map className="w-6 h-6 text-lime-green flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">A planning checklist</strong> for the ten steps, from Define Your Destination to Reinforce Change &amp; Continual ShIFt
                </span>
              </li>
              <li className="text-body flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-purple flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">A gut check</strong> to see where your change stands at each stage
                </span>
              </li>
              <li className="text-body flex gap-3">
                <Sparkles className="w-6 h-6 text-raspberry flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  Built on the <strong className="text-navy">P.A.T.H.™</strong>: Prepare, Align, Take Off, Create Habits
                </span>
              </li>
            </ul>
          </div>

          {/* Right: Form */}
          <div className="bg-white border-2 border-border rounded shadow-lg p-8 md:sticky md:top-8">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-2">Send Me My Free Planner</h3>
            <p className="text-body -sm text-muted-foreground mb-6">
              Drop your info below and we'll email it over right away.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="newsletter"
                  checked={newsletter}
                  onCheckedChange={(v) => setNewsletter(v === true)}
                  className="mt-1"
                />
                <Label htmlFor="newsletter" className="text-sm font-normal text-charcoal cursor-pointer">
                  Yes, send me the occasional Painted Porch newsletter with tips and resources.
                </Label>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal hover:bg-teal/90 text-white text-lg py-6 rounded"
              >
                {submitting ? "Sending..." : "Send Me My Free Planner"}
              </Button>

              <p className="text-body text-muted-foreground text-center">
                We won't send spam. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
