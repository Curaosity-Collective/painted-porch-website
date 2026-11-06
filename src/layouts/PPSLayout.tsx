import { useLayoutEffect, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PPSNavigation from "@/components/pps/PPSNavigation";
import PPSFooter from "@/components/pps/PPSFooter";
import SiteHeader from "@/components/v3/SiteHeader";
import SiteFooter from "@/components/v3/SiteFooter";
import { usesV3Chrome, usesV3Skin } from "@/config/siteChrome";
import { V3SkinContext } from "@/components/v3/v3SkinContext";
import { useV3Preview } from "@/hooks/useV3Preview";
import { useMoneyMentions } from "@/hooks/useMoneyMentions";
import PageGate from "@/components/pps/PageGate";
import GitHubSyncBanner from "@/components/pps/admin/GitHubSyncBanner";
import { PathFinderQuizProvider } from "@/components/pps/quiz/PathFinderQuizProvider";

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  // Also reset documentElement/body in case overflow is on a different root
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
}

// Disable browser's automatic scroll restoration so we control it
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

export default function PPSLayout() {
  const { pathname, hash, search } = useLocation();
  useMoneyMentions(pathname);
  // The redesign's header and footer: Draft pages now, every page at go-live.
  // Restyled live pages (speaking, topics, workshops, contact) use them with
  // their restyle layer in preview (?v3=1, admins and editors) and at go-live.
  const v3Preview = useV3Preview(search);
  const v3Chrome = usesV3Chrome(pathname, v3Preview);
  const v3Skin = usesV3Skin(pathname, v3Preview);

  // Immediate scroll before paint — skip when navigating to an in-page anchor
  useLayoutEffect(() => {
    if (hash) return;
    scrollToTop();
  }, [pathname, hash]);

  // Safety net: scroll again after async content (images/videos/lazy routes) may have shifted layout
  useEffect(() => {
    if (hash) return;
    scrollToTop();
    const t1 = setTimeout(scrollToTop, 50);
    const t2 = setTimeout(scrollToTop, 200);
    const t3 = setTimeout(scrollToTop, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, hash]);


  return (
    <PathFinderQuizProvider>
      <div className="min-h-screen flex flex-col overflow-x-clip">
        <GitHubSyncBanner />
        {v3Chrome ? <SiteHeader /> : <PPSNavigation />}
        <main className="flex-1">
          <V3SkinContext.Provider value={v3Skin}>
            <PageGate>
              {v3Skin ? (
                <div className="v3-skin">
                  <Outlet />
                </div>
              ) : (
                <Outlet />
              )}
            </PageGate>
          </V3SkinContext.Provider>
        </main>
        {v3Chrome ? <SiteFooter /> : <PPSFooter />}
      </div>
    </PathFinderQuizProvider>
  );
}

