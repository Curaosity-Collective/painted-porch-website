import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface LogoItem {
  name: string;
  src: string;
  href?: string;
}

export const allClientLogos: LogoItem[] = [
  { name: "AB Staffing", src: "/logos/ab-staffing.png", href: "https://www.abstaffing.com/" },
  { name: "Avant Healthcare", src: "/logos/avant-healthcare.webp", href: "https://avanthealthcare.com/" },
  { name: "Gifted Healthcare", src: "/logos/gifted-healthcare.webp", href: "https://giftedhealthcare.com/" },
  { name: "Insight Global Healthcare", src: "/logos/insight-global.png", href: "https://insightglobal.com/industries/healthcare/" },
  { name: "Newbury Partners", src: "/logos/newbury-partners.jpg", href: "https://newburypartners.com/" },
  { name: "RN Network", src: "/logos/rn-network.png", href: "https://rnnetwork.com/" },
  { name: "Sixcel", src: "/logos/sixcel.jpg", href: "https://sixcel.com/" },
  { name: "TargetRecruit", src: "/logos/targetrecruit.jpg", href: "https://targetrecruit.com/" },
  { name: "Triage Staffing", src: "/logos/triage.png", href: "https://triagestaff.com/" },
  { name: "Vital Solution", src: "/logos/cardiosolution.png", href: "https://vitalsolution.com/" },
  { name: "AtWork", src: "/logos/atwork.jpg", href: "https://www.atwork.com/" },
  { name: "AutoZone", src: "/logos/autozone.png", href: "https://www.autozone.com/" },
  { name: "Earn Your Best", src: "/logos/earn-your-best.jpg", href: "https://www.earnitall.com/" },
  { name: "GHR Healthcare", src: "/logos/ghr-healthcare.png", href: "https://www.ghrhealthcare.com/" },
  { name: "PrimeTime Healthcare", src: "/logos/primetime-healthcare.jpg", href: "https://www.primetimehealthcare.com/" },
  { name: "Regents Consulting", src: "/logos/regents-consulting.png", href: "https://www.regentsconsulting.com/" },
  { name: "Solar Sandy", src: "/logos/solar-sandy.png", href: "https://asksolarsandy.com/" },
  { name: "Fortis Healthcare Solutions", src: "/logos/fortis-healthcare.svg", href: "https://www.fortishealthcaresolutions.com/" },
  { name: "Adaptive Workforce Solutions", src: "/logos/adaptive-wfs.png", href: "https://www.adaptivewfs.com/" },
];

// Each track holds at least this many logos, so a short list (Sierra's has
// five) still runs edge to edge on a wide screen instead of leaving a gap
// before the loop restarts.
const MIN_LOGOS_PER_TRACK = 10;
// Seconds per logo, so every strip moves at the same speed.
const SECONDS_PER_LOGO = 5;

function LogoTrack({ logos, duration, copy }: { logos: LogoItem[]; duration: number; copy?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-8 px-4 md:gap-16 md:px-8 animate-marquee"
      style={{ animationDuration: `${duration}s` }}
      // The second track only completes the loop; screen readers and the
      // keyboard get the logos once.
      aria-hidden={copy || undefined}
    >
      {logos.map((logo, i) => (
        <a
          key={`${logo.name}-${i}`}
          href={logo.href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={copy ? -1 : undefined}
          className="flex-shrink-0 w-[112px] h-[56px] md:w-[140px] md:h-[70px] flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
        >
          {/* Not lazy: these images come into view by sliding sideways, and
              browsers don't load lazy images that arrive that way, which left
              empty slots in the strip (PPS Admin, 2026-11-06). */}
          <img
            src={logo.src}
            alt={copy ? "" : logo.name}
            className="max-w-full max-h-full object-contain"
            decoding="async"
          />
        </a>
      ))}
    </div>
  );
}

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  organization: string;
}

const placeholderTestimonials: Testimonial[] = [
  {
    quote: "[Testimonial placeholder, to be replaced with client testimonials as they become available]",
    name: "[Name]",
    title: "[Title]",
    organization: "[Organization]",
  },
  {
    quote: "[Testimonial placeholder #2]",
    name: "[Name]",
    title: "[Title]",
    organization: "[Organization]",
  },
  {
    quote: "[Testimonial placeholder #3]",
    name: "[Name]",
    title: "[Title]",
    organization: "[Organization]",
  },
  {
    quote: "[Testimonial placeholder #4]",
    name: "[Name]",
    title: "[Title]",
    organization: "[Organization]",
  },
];

interface ClientLogoMarqueeProps {
  heading?: ReactNode;
  className?: string;
  logos?: LogoItem[];
  testimonials?: Testimonial[];
  showTestimonials?: boolean;
}

export default function ClientLogoMarquee({
  heading = (
    <>
      Our Partners &amp; Clients Making Sh<span className="text-raspberry font-bold">IF</span>t Happen
    </>
  ),
  className = "",
  logos,
  testimonials = placeholderTestimonials,
  showTestimonials = false,
}: ClientLogoMarqueeProps) {
  const displayLogos = logos || allClientLogos;
  const repeats = displayLogos.length ? Math.ceil(MIN_LOGOS_PER_TRACK / displayLogos.length) : 0;
  const trackLogos = Array.from({ length: repeats }, () => displayLogos).flat();
  const duration = trackLogos.length * SECONDS_PER_LOGO;
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (dir: "prev" | "next") => {
    setActiveIndex((prev) =>
      dir === "next"
        ? (prev + 1) % testimonials.length
        : (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className={`py-16 md:py-20 bg-white overflow-hidden ${className}`}>
      <div
        ref={ref}
        className={`text-center transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-navy mb-12 px-6">
          {heading}
        </h2>

        <div className="relative">
          {/* Narrow fades on phones: at 96px each they hid half the strip. */}
          <div className="absolute left-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-white to-transparent z-10" />

          <div className="flex overflow-hidden [&:hover>div]:animation-play-state-paused">
            <LogoTrack logos={trackLogos} duration={duration} />
            <LogoTrack logos={trackLogos} duration={duration} copy />
          </div>
        </div>

        {showTestimonials && testimonials.length > 0 && (
          <div className="max-w-3xl mx-auto mt-12 px-6">
            <div className="relative flex items-center gap-4">
              <button
                onClick={() => goTo("prev")}
                className="flex-shrink-0 w-10 h-10 rounded-full border border-muted-foreground/20 flex items-center justify-center text-muted-foreground hover:text-navy hover:border-navy transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 min-h-[120px] flex flex-col justify-center">
                <blockquote className="text-lead font-poppins italic text-navy leading-relaxed mb-4">
                  "{testimonials[activeIndex].quote}"
                </blockquote>
                <p className="text-body-sm text-muted-foreground">
                  {[testimonials[activeIndex].name, testimonials[activeIndex].title, testimonials[activeIndex].organization]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>

              <button
                onClick={() => goTo("next")}
                className="flex-shrink-0 w-10 h-10 rounded-full border border-muted-foreground/20 flex items-center justify-center text-muted-foreground hover:text-navy hover:border-navy transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex ? "bg-navy w-6" : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
