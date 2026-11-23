import { Navigate, useLocation } from "react-router-dom";
import { usePageStatuses } from "@/hooks/usePageStatuses";
import { useUserRole } from "@/hooks/useUserRole";
import { resolvePageStatus } from "@/config/pageStatus";
import { archivedDestination } from "@/config/archivedPages";
import { canonicalPath } from "@/lib/canonical-url";
import { isLovableEditorPreview } from "@/lib/lovablePreview";
import ComingSoon from "@/pages/pps/ComingSoon";

interface PageGateProps {
  children: React.ReactNode;
}

/**
 * Inspects the current pathname against the live page-status map (DB).
 * - "live" routes render normally.
 * - A wrong-case or trailing-slash form of an address (/ABOUT, /about/) goes to
 *   the real address, which is then gated as usual.
 * - Only admin or editor roles bypass and see the real page, archived pages
 *   included. Other authenticated users (contributors, authors, public
 *   assessment users) are treated as visitors.
 * - Archived pages send visitors on to the page that replaced them
 *   (src/config/archivedPages.json).
 * - Unfinished ("draft") pages show visitors the Coming Soon page, marked noindex.
 * - The Lovable editor preview iframe always bypasses (preview-only).
 *
 * Addresses with no route never reach the gate: App.tsx's catch-all renders
 * the noindex "Page not found" page outside PPSLayout.
 *
 * PPS Admin, 2026-11-23: "If its a draft/unfinished/pending it [can] show the
 * coming soon page. If its archived it should redirect vs just saying page not found."
 *
 * Wrap this around <Outlet /> in PPSLayout so every route is gated centrally.
 */
export default function PageGate({ children }: PageGateProps) {
  const { pathname, search, hash } = useLocation();
  const { map, loading: statusLoading } = usePageStatuses();
  const { role, loading: roleLoading } = useUserRole();
  const status = resolvePageStatus(pathname, map);

  if (status === "live") return <>{children}</>;

  // Lovable editor preview iframe always bypasses gating (preview-only).
  if (isLovableEditorPreview()) return <>{children}</>;

  // Avoid a flash (or a wrong redirect) before role + status resolve.
  if (roleLoading || statusLoading) return null;

  // React Router matches routes ignoring case and trailing slashes, but page
  // status is keyed by the exact address, so /ABOUT and /about/ would read as drafts.
  const realPath = canonicalPath(pathname);
  if (realPath !== pathname) return <Navigate to={`${realPath}${search}${hash}`} replace />;

  // Only admins and editors can see draft and archived pages.
  if (role === "admin" || role === "editor") return <>{children}</>;

  const replacement = archivedDestination(pathname);
  if (replacement) return <Navigate to={`${replacement}${search}${hash}`} replace />;

  return <ComingSoon />;
}
