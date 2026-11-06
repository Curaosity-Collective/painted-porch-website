import { useEffect, useRef, type RefObject } from "react";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import teamsCtaBg from "@/assets/heroes/teams-hero.jpg";

/**
 * The free Elemental Style quiz, open to everyone with no sign-up (PPS Admin, 2026-11-06).
 * The quiz runs full width through AidaForm's own embed, which sizes it to its content.
 */
const ASSESSMENT_URL = "https://paintedporchstrategies.aidaform.com/your-elemental-style-free";
const AIDAFORM_APP = "form202405";
const AIDAFORM_LOADER_ID = "aidaform-app";
const AIDAFORM_LOADER_SRC = "https://widget.aidaform.com/embed.js";

type AidaFormApp = { mount: (el: HTMLElement) => void };
let loaderHasRun = false;

/**
 * AidaForm's loader mounts every `[data-aidaform-app]` element once, when it first loads.
 * Pages here change without a reload, so on a later visit the quiz is mounted directly.
 */
function useAidaFormEmbed(ref: RefObject<HTMLDivElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const appFor = () => (window as unknown as Record<string, AidaFormApp | undefined>)[AIDAFORM_APP];
    const mountOnce = () => {
      const app = appFor();
      if (app?.mount && el.childElementCount === 0) app.mount(el);
      return Boolean(app?.mount);
    };

    if (!document.getElementById(AIDAFORM_LOADER_ID)) {
      // First visit: the loader finds this element and mounts the quiz itself.
      const script = document.createElement("script");
      script.id = AIDAFORM_LOADER_ID;
      script.src = AIDAFORM_LOADER_SRC;
      script.async = true;
      script.addEventListener("load", () => {
        loaderHasRun = true;
      });
      document.head.appendChild(script);
      return;
    }
    if (!loaderHasRun) return; // The loader is still on its way and will mount it.
    if (mountOnce()) return;
    // The loader ran on an earlier visit and the quiz script is still loading.
    const timer = window.setInterval(() => {
      if (mountOnce()) window.clearInterval(timer);
    }, 200);
    return () => window.clearInterval(timer);
  }, [ref]);
}

export default function ElementalStyleAssessment() {
  useDocumentSeo({
    title: "Your Elemental Style: Free Assessment | Painted Porch Strategies",
    description:
      "A free five-minute quiz on your natural communication and collaboration style: how you show up, where you shine, and how you connect best with others. No sign-up.",
    canonical: "/elemental-style-assessment",
  });
  const embedRef = useRef<HTMLDivElement>(null);
  useAidaFormEmbed(embedRef);

  return (
    <div>
      <section className="bg-white pt-12 pb-8 md:pt-16">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="max-w-3xl">
            <Link to="/resources/free" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Free Resources
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple/20 text-navy mb-4">
              <ClipboardCheck className="w-3.5 h-3.5" /> Free Assessment
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-4">
              What's Your <span className="text-primary">Elemental Style?</span>
            </h1>
            <p className="text-body text-foreground">
              Discover your natural communication and collaboration style in less than five minutes: your style
              snapshot, your strengths and stretch zones, and simple ideas for working better with people whose style
              is different from yours. It's free, and there's nothing to sign up for.
            </p>
          </div>
        </div>
      </section>

      <section id="assessment" aria-label="Elemental Style quiz" className="bg-white pb-12">
        <div className="container max-w-5xl mx-auto px-2 sm:px-6">
          <div
            ref={embedRef}
            data-aidaform-app={AIDAFORM_APP}
            data-url={ASSESSMENT_URL}
            data-width="100%"
            data-height="500px"
            data-do-resize=""
          />
          <p className="text-body text-center -sm text-muted-foreground mt-4 px-4">
            Trouble loading the quiz?{" "}
            <a href={ASSESSMENT_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
              Open it in a new tab
            </a>
            .
          </p>
        </div>
      </section>

      <ParallaxCTA
        backgroundImage={teamsCtaBg}
        overlayClass="bg-gradient-to-b from-navy/65 via-navy/55 to-navy/65"
        headline="Ready to put your style to work?"
        description="Now that you know your style, see how we partner with leaders and teams on the P.A.T.H."
        actions={[
          {
            label: "Explore The P.A.T.H.",
            to: "/the-path",
            ariaLabel: "Explore The P.A.T.H. with Painted Porch Strategies",
          },
        ]}
      />
    </div>
  );
}
