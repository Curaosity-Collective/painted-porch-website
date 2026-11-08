import { createContext, useContext } from "react";

/**
 * True inside the public website's layout (PPSLayout), including dialogs opened from it, which inherit React context
 * through their portals. The shared Button reads it to set public-site button text in spaced capitals (PPS-DEC-0028)
 * while staff screens (`/admin`, outside the layout) keep their own button text.
 */
export const PublicSiteContext = createContext(false);

export function usePublicSite(): boolean {
  return useContext(PublicSiteContext);
}
