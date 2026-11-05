import { useEffect, useRef, type ReactNode } from "react";

/*
 * Motion primitives for the Epic ShIFt redesign ("v3").
 * Ported from pps-simplified src/components/site/Motion.tsx. Every effect is
 * disabled under prefers-reduced-motion.
 */

/**
 * Slow vertical drift on scroll (parallax). Wrap an oversized image inside an
 * overflow-hidden frame so the drift never exposes edges.
 */
export function Parallax({
  children,
  speed = 60,
  className = "",
}: {
  children: ReactNode;
  /** Pixels of total travel across the viewport. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 .. 1 as the element crosses the viewport
      const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - vh / 2) / vh));
      el.style.transform = `translate3d(0, ${(-progress * speed).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/** A framed photograph that drifts gently as it crosses the viewport. */
export function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 60,
  width,
  height,
  imagePositionClassName = "object-center",
}: {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  width?: number;
  height?: number;
  /** Set mobile and desktop focal positions with responsive object-position utilities. */
  imagePositionClassName?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <Parallax speed={speed} className="h-full">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width={width}
          height={height}
          className={`h-full w-full scale-[1.15] object-cover ${imagePositionClassName}`}
        />
      </Parallax>
    </div>
  );
}

/**
 * Two-column layout where the image holds still (sticky) while the copy
 * scrolls alongside it. Collapses to a simple stack on mobile.
 */
export function StickyMedia({
  src,
  alt,
  children,
  reverse = false,
  width,
  height,
}: {
  src: string;
  alt: string;
  children: ReactNode;
  reverse?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
      <div className={`order-2 lg:col-span-5 ${reverse ? "lg:order-2" : "lg:order-1"}`}>
        <div className="lg:sticky lg:top-24">
          <ParallaxImage src={src} alt={alt} width={width} height={height} className="h-72 w-full lg:h-[70vh]" speed={40} />
        </div>
      </div>
      <div className={`order-1 lg:col-span-7 ${reverse ? "lg:order-1" : "lg:order-2"}`}>{children}</div>
    </div>
  );
}

/** A quiet, drifting word or numeral that gives a section a second visual depth. */
export function GhostLayer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Parallax speed={-24} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <span aria-hidden="true" className="ghost-numeral absolute -right-8 top-16 text-[9rem] opacity-70 md:text-[15rem]">
        {children}
      </span>
    </Parallax>
  );
}
