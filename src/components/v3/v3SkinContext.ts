import { createContext, useContext } from "react";

/**
 * True when a live page renders with the redesign's restyle layer (Phase 3).
 * Pages read it to show the compact additions PPS Admin approved, which stay
 * hidden on the current site until go-live.
 */
export const V3SkinContext = createContext(false);

export function useV3Skin(): boolean {
  return useContext(V3SkinContext);
}
