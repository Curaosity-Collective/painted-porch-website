import { Link } from "react-router-dom";
import { useRef, useState, useCallback, useEffect } from "react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { Button } from "@/components/ui/button";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { useParallax } from "@/hooks/useParallax";
import { useCountUp } from "@/hooks/useCountUp";
import { supabase } from "@/integrations/supabase/client";
import { verifySiteVideoUrl } from "@/lib/verifySiteVideo";
import VideoFallback from "@/components/pps/VideoFallback";
import impactCta from "@/assets/images/impact-cta-begin.jpg";
import { Eyebrow } from "@/components/pps/Eyebrow";
import { CHARITIES } from "@/data/charities";
import { FEATURED_TESTIMONIALS } from "@/pages/pps/v3/testimonials";
// Hero video URL is loaded from the site_videos registry (slot: "impact-hero").
// Manage at /admin/videos. No fallback file is bundled, videos must live in Cloud Storage.
// Real client quotes (Amy's LinkedIn recommendations) shared with the redesign.
// The three role-only quotes that were here were placeholders (PPS Admin, 2026-11-05).
const TESTIMONIAL_BORDERS = ["border-strategic", "border-primary", "border-lime"];
const testimonials = FEATURED_TESTIMONIALS.map((t, i) => {
  const [author, role] = t.who.split(" · ");
  return { quote: t.quote, author, company: role, color: TESTIMONIAL_BORDERS[i % TESTIMONIAL_BORDERS.length] };
});

export default function OurImpact() {
  useDocumentSeo({
    title: "Our Impact | Do Good ShIFt | Painted Porch Strategies",
    description: "5% of every engagement funds charities our clients care about. See the impact partners and the Do Good ShIFt story behind Painted Porch Strategies.",
    ogImage: impactCta,
  });
  const { ref: ctaRef, parallaxOffset } = useParallax<HTMLElement>({ mode: "viewport", range: 80, offset: 40 });
  const { value: totalGiven, ref: counterRef } = useCountUp({ end: 31474, duration: 2500 });

  // Single looping hero video (uses native `loop` for reliable continuous playback)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>("");
  const [videoFailed, setVideoFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const showVideo = Boolean(heroVideoUrl) && !videoFailed;

  // Resolve admin-managed hero video URL
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_videos")
      .select("video_url")
      .eq("slot_key", "impact-hero")
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const resolved = data?.video_url ?? null;
        if (resolved) {
          setHeroVideoUrl(resolved);
        } else {
          setVideoFailed(true);
        }
        verifySiteVideoUrl("impact-hero", resolved);
      });
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const handleRetry = () => {
    setVideoFailed(false);
    setHeroVideoUrl("");
    setRetryToken((n) => n + 1);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = 0.6;
    // Safety net: if the browser ever fires `ended` despite `loop`, restart manually.
    const onEnded = () => {
      v.currentTime = 0;
      v.play().catch(() => {});
    };
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, [heroVideoUrl]);

  return (
    <div>
      {/* Hero, Animated Paint Splash Video */}
      <section className="relative isolate min-h-[70vh] flex items-center overflow-hidden bg-navy">
        <div className="absolute inset-0 isolate" data-testid="impact-hero-video">
          {showVideo ? (
            <video
              ref={videoRef}
              src={heroVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setVideoFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            // Friendly fallback: branded gradient + soft animated paint-splash glow.
            // Shown when the impact-hero slot has no URL or the video fails to load.
            <VideoFallback variant="hero" state="error" onRetry={handleRetry} />
          )}
        </div>
        {/* Subtle overlay for text legibility */}
        <div className="absolute inset-0 z-[1] bg-navy/40" />
        <div className="container max-w-7xl mx-auto px-6 relative z-10 py-16 md:py-24">
          <div className="md:w-4/5">
            <div className="rounded-xl border border-white/10 bg-navy/35 p-8 backdrop-blur-sm md:p-12">
              <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
                Making a Difference
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Our Impact
              </h1>
              <p className="text-lead text-white/90 mb-8 max-w-3xl" data-body-allow>
                See how we've helped organizations transform their approach to change, build resilient leaders, and create lasting impact.
              </p>
              <Link to="/start-here">
                <Button className="bg-gold border-2 border-gold text-navy hover:bg-white hover:text-gold text-lg py-6 px-8 transition-colors">
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By, reusable marquee */}
      <ClientLogoMarquee />

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              What Our Partners Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white p-8 rounded-xl border-l-4 ${testimonial.color}`}
              >
                <blockquote className="text-body text-foreground italic mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <p className="text-body-sm font-semibold text-navy mb-0">{testimonial.author}</p>
                  <p className="text-body-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charitable Giving */}
      <section id="do-good-shift" className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <span className="bg-lime/10 text-lime font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4 inline-block">Do Good Sh<span className="text-raspberry font-bold">IF</span>t</span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            A Virtuous Cycle of Giving
          </h2>
          <p className="text-body text-foreground leading-relaxed mb-6">
            Painted Porch Strategies was created to model the Stoic principles of Reason, Logic, Purpose, and Virtue.
          </p>
          <p className="text-body text-foreground leading-relaxed mb-6">
            We continually strive to follow the Stoic philosopher, Seneca's, advice of "works not words", and believe that in order to do <em>well</em>, we must also do <em>good</em>.
          </p>
          <p className="text-body text-foreground leading-relaxed mb-6">
            That's why <span className="font-semibold text-lime">5% of your investment is donated to charity</span>. Because business success and social impact go hand in hand.
          </p>
          <p className="text-body text-foreground leading-relaxed">
            When you partner with the Painted Porch, you're not just investing in yourself, your team, or your organization. You're contributing to causes that can create epic sh<span className="text-raspberry font-semibold">IF</span>t in the world.
          </p>
          <div ref={counterRef} className="mt-12 py-10 px-6 rounded-2xl bg-lime/10 border border-lime/20">
            <Eyebrow variant="plain" tone="lime" as="p">Total Given to Date</Eyebrow>
            <p className="text-body text-5xl md:text-6xl font-bold text-lime tabular-nums">
              ${totalGiven.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Who You've Helped Support */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Who You've Helped Support
          </h2>
          <p className="text-body text-muted-foreground mb-10 max-w-2xl mx-auto">
            Every partnership makes a difference. Here are the organizations benefiting from your investment.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-stretch">
            {CHARITIES.map((charity) => {
              const domain = new URL(charity.href).hostname;
              return (
                <a
                  key={charity.name}
                  href={charity.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg px-4 py-5 flex flex-col items-center justify-center gap-2 text-center font-poppins font-semibold text-sm text-navy shadow-sm hover:shadow-md hover:text-primary transition-all duration-200"
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                    alt={`${charity.name} icon`}
                    className="w-6 h-6 rounded-sm"
                    loading="lazy"
                  />
                  {charity.name}
                </a>
              );
            })}
          </div>
        </div>
      </section>


      <ParallaxCTA
        backgroundImage={impactCta}
        overlayTone="gold"
        headline="Ready to Make an Impact?"
        description="Join the leaders, teams, and organizations that have transformed their approach to change, starting at Phase Zero."
        actions={[
          { label: "Start Your Journey", to: "/start-here", variant: "primary" },
        ]}
      />
    </div>
  );
}
