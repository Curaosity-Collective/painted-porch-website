import { Flame, Sparkles, Landmark, type LucideIcon } from "lucide-react";

/**
 * Centralized Tier Configuration
 * 
 * This is the single source of truth for all partnership tier branding.
 * Any page displaying tier icons, colors, or names should import from here.
 * 
 * Icon Psychology:
 * - Flame (IGNITE): Spark, clarity, individual insight - lighting the fire of transformation
 * - Sparkles (AMPLIFY): Radiant energy, burst, momentum - amplifying impact through workshops
 * - Landmark (EMBODY): Architecture, permanence, foundation - building unshakeable structures
 */

export interface TierConfig {
  /** Internal key. The names IGNITE, AMPLIFY and EMBODY are no longer shown publicly (PPS-DEC-0025). */
  key: "IGNITE" | "AMPLIFY" | "EMBODY";
  /** Public label. */
  name: string;
  tagline: string;
  icon: LucideIcon;
  emoji: string;
  /** CSS class for background color (e.g., "bg-gold/10") */
  bgColor: string;
  /** CSS class for border color (e.g., "border-gold") */
  borderColor: string;
  /** CSS class for icon/text color (e.g., "text-gold") */
  textColor: string;
  /** CSS classes for solid button with inverse hover on light backgrounds */
  solidButtonClasses: string;
  /** CSS classes for outline button with inverse hover */
  outlineButtonClasses: string;
  /** Route path for the tier page */
  href: string;
}

export const TIERS = {
  IGNITE: {
    key: "IGNITE",
    name: "Self-Led",
    tagline: "For you: self-led learning",
    icon: Flame,
    emoji: "🔥",
    bgColor: "bg-gold/10",
    borderColor: "border-gold",
    textColor: "text-gold",
    solidButtonClasses: "bg-gold border-2 border-gold text-white hover:bg-white hover:text-gold",
    outlineButtonClasses: "bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-white",
    href: "/partner/ignite/assessments",
  },
  AMPLIFY: {
    key: "AMPLIFY",
    name: "Team",
    tagline: "For your team: workshops and Leadership Labs",
    icon: Sparkles,
    emoji: "✨",
    bgColor: "bg-strategic/10",
    borderColor: "border-strategic",
    textColor: "text-strategic",
    solidButtonClasses: "bg-strategic border-2 border-strategic text-white hover:bg-white hover:text-strategic",
    outlineButtonClasses: "bg-transparent border-2 border-strategic text-strategic hover:bg-strategic hover:text-white",
    href: "/partner/amplify/workshops",
  },
  EMBODY: {
    key: "EMBODY",
    name: "Organization",
    tagline: "For your organization: the three ShIFts",
    icon: Landmark,
    emoji: "🏛️",
    bgColor: "bg-navy/10",
    borderColor: "border-navy",
    textColor: "text-navy",
    solidButtonClasses: "bg-navy border-2 border-navy text-white hover:bg-white hover:text-navy",
    outlineButtonClasses: "bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white",
    href: "/the-path",
  },
} as const satisfies Record<string, TierConfig>;

/** Array of all tiers in display order */
export const TIER_LIST: TierConfig[] = [TIERS.IGNITE, TIERS.AMPLIFY, TIERS.EMBODY];

/** Get a tier by name */
export function getTier(name: "IGNITE" | "AMPLIFY" | "EMBODY"): TierConfig {
  return TIERS[name];
}