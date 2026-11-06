/** Display-only matches. Never changes prices, source copy, or stored content. */
export function findMoneyMentions(text: string): { start: number; end: number }[] {
  const pattern = /(?:US\s*)?\$\s*\d[\d,]*(?:\.\d+)?(?:\s?[kmbt]\b)?(?:\s*[–−-]\s*\$?\s*\d[\d,]*(?:\.\d+)?(?:\s?[kmbt]\b)?)?(?:\s*(?:per (?:month|year|person|team)|\/(?:mo|month|yr|year)))?|\b\d[\d,]*(?:\.\d+)?\s*(?:dollars|USD)\b/gi;
  return Array.from(text.matchAll(pattern), (match) => ({
    start: match.index,
    end: match.index + match[0].length,
  }));
}