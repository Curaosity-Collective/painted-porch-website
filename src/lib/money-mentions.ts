/** Display-only matches. Never changes prices, source copy, or stored content. */
export function findMoneyMentions(text: string): { start: number; end: number }[] {
  const pattern = /(?:\b(?:starting at|normally|from|investment:?)\s+)?(?:US\s*)?\$\s*\d[\d,]*(?:\.\d+)?(?:\s?[kmbt]\b)?(?:\s*[–−-]\s*\$?\s*\d[\d,]*(?:\.\d+)?(?:\s?[kmbt]\b)?)?(?:\s*(?:per (?:month|year|person|team)|\/(?:mo|month|yr|year)))?|\b\d[\d,]*(?:\.\d+)?\s*(?:dollars|USD)\b|\b(?:money|monetary|fees?|pricing|prices?|investment|financial)\b/gi;
  return Array.from(text.matchAll(pattern), (match) => ({
    start: match.index,
    end: match.index + match[0].length,
  }));
}