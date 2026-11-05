import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-in reveal for the Epic ShIFt redesign ("v3"). Content stays visible
 * until the page is interactive; only then is it armed to animate, so nothing
 * is hidden from crawlers, pre-rendered HTML or reduced-motion readers.
 * Ported from pps-simplified src/components/site/Extras.tsx.
 */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" },
    );
    el.classList.add("reveal-armed");
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
