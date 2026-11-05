/**
 * Certifications and memberships shown on the live Our Approach page and the
 * About redesign, so a badge is added once.
 */
import workingGeniusBadge from "@/assets/certifications/working-genius.png";
import prosciChangeBadge from "@/assets/certifications/prosci-change-practitioner.png";
import scrumPsdBadge from "@/assets/certifications/scrum-psd.png";
import csiBadge from "@/assets/certifications/csi.png";
import changeNavigatorBadge from "@/assets/certifications/change-navigator.png";
import leanChangeAgentBadge from "@/assets/certifications/lean-change-agent.png";
import leanChangeAiBadge from "@/assets/certifications/lean-change-ai.png";
import mawFacilitatorBadge from "@/assets/certifications/maw-facilitator.png";
import discFacilitatorBadge from "@/assets/certifications/disc-facilitator.png";
import eq360Badge from "@/assets/certifications/eq360.png";
import emotionallyEffectiveBadge from "@/assets/certifications/emotionally-effective-leader.png";
import wpcRecommendedBadge from "@/assets/certifications/wpc-recommended.png";
import acmpMemberBadge from "@/assets/certifications/acmp-member.png";
import asaMemberBadge from "@/assets/certifications/asa-member.png";

export interface Certification {
  name: string;
  badge: string;
}

export const CERTIFICATIONS: Certification[] = [
  { name: "Working Genius Certified", badge: workingGeniusBadge },
  { name: "Prosci Change Practitioner", badge: prosciChangeBadge },
  { name: "Scrum.org PSD", badge: scrumPsdBadge },
  { name: "CSI Certified", badge: csiBadge },
  { name: "Change Navigator", badge: changeNavigatorBadge },
  { name: "Lean Change Agent", badge: leanChangeAgentBadge },
  { name: "Lean Change AI", badge: leanChangeAiBadge },
  { name: "MAW Facilitator", badge: mawFacilitatorBadge },
  { name: "DiSC Facilitator", badge: discFacilitatorBadge },
  { name: "EQ-360 Certified", badge: eq360Badge },
  { name: "Emotionally Effective Leader", badge: emotionallyEffectiveBadge },
  { name: "WPC Recommended", badge: wpcRecommendedBadge },
  { name: "ACMP Member", badge: acmpMemberBadge },
  { name: "ASA Member", badge: asaMemberBadge },
];
