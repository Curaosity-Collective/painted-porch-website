import { useEffect } from "react";
import { findMoneyMentions } from "@/lib/money-mentions";

const EXCLUDED = 'script, style, noscript, input, textarea, select, option, svg, canvas, [contenteditable]:not([contenteditable="false"]), [data-money-highlight="off"]';

/** Native text highlights keep React's DOM, links, and accessible text untouched. */
export function useMoneyMentions(pathname: string) {
  useEffect(() => {
    if (pathname.startsWith("/admin") || !CSS.highlights || typeof Highlight === "undefined") return;
    let frame = 0;

    const refresh = () => {
      const light: Range[] = [];
      const dark: Range[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let current = walker.nextNode();
      while (current) {
        const node = current;
        current = walker.nextNode();
        const parent = node.parentElement;
        if (!parent || parent.closest(EXCLUDED)) continue;
        // React may render "$" and a formatted number as separate sibling nodes.
        if (node.previousSibling?.nodeType === Node.TEXT_NODE) continue;
        const nodes: Node[] = [node];
        let sibling = node.nextSibling;
        while (sibling?.nodeType === Node.TEXT_NODE) {
          nodes.push(sibling);
          sibling = sibling.nextSibling;
        }
        const text = nodes.map((part) => part.textContent ?? "").join("");
        const matches = findMoneyMentions(text);
        if (!matches.length) continue;
        let onDark = false;
        for (let surface: Element | null = parent; surface; surface = surface.parentElement) {
          const background = getComputedStyle(surface).backgroundColor;
          const channels = background.match(/[\d.]+/g)?.map(Number);
          if (!channels || (channels.length > 3 && channels[3] < 0.5)) continue;
          const [r, g, b] = channels;
          onDark = (r * 0.2126 + g * 0.7152 + b * 0.0722) < 145;
          break;
        }
        for (const match of matches) {
          const range = document.createRange();
          let offset = 0;
          for (const part of nodes) {
            const length = part.textContent?.length ?? 0;
            if (match.start >= offset && match.start < offset + length) range.setStart(part, match.start - offset);
            if (match.end > offset && match.end <= offset + length) range.setEnd(part, match.end - offset);
            offset += length;
          }
          (onDark ? dark : light).push(range);
        }
      }
      CSS.highlights.set("pps-money", new Highlight(...light));
      CSS.highlights.set("pps-money-on-dark", new Highlight(...dark));
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    schedule();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      CSS.highlights.delete("pps-money");
      CSS.highlights.delete("pps-money-on-dark");
    };
  }, [pathname]);
}