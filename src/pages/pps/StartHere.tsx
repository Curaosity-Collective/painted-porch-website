import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";

/**
 * /start-here (PPS Admin, 2026-11-07): the Start Here page is retired, and its address opens the Find
 * Your Next ShIFt guide over the homepage. Links to /start-here (old emails, /for-leaders) keep doing
 * what they did: open the guide. Its hero now closes The P.A.T.H. page. The site search's guide result
 * opens the guide where the visitor already is.
 *
 * The guide lives in the layout (PathFinderQuizProvider), so it stays open while this route hands over
 * to the homepage. The query and #anchor are kept.
 */
export default function StartHere() {
  const { open: openGuide } = usePathFinderQuiz();
  const { search, hash } = useLocation();

  useEffect(() => {
    openGuide();
  }, [openGuide]);

  return <Navigate to={`/${search}${hash}`} replace />;
}
