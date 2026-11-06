import { Navigate, useLocation } from "react-router-dom";

/**
 * Permanent move (PPS-DEC-0025 amendment, PPS Admin 2026-11-06): forwards to the new
 * address, keeping the query and the #anchor, so an old link to a workshop card still
 * lands on that card.
 */
export function MovedTo({ to }: { to: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={`${to}${search}${hash}`} replace />;
}
