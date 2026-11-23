import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

function RedirectBlogToInsights() {
  const { slug } = useParams();
  return <Navigate to={`/resources/insights/${slug ?? ""}`} replace />;
}
import { useEffect } from "react";
import { lazyPage } from "./lib/lazy-page";
import ScrollToTop from "./components/ScrollToTop";
import { getSiteUrl } from "@/lib/site-url";
import NotFound from "./pages/NotFound";

// Painted Porch Strategies Pages
import PPSLayout from "./layouts/PPSLayout";
import PageGate from "./components/pps/PageGate";
const PPSHome = lazyPage(() => import("./pages/pps/PPSHome"));
const PhaseZero = lazyPage(() => import("./pages/pps/PhaseZero"));
const PPSAbout = lazyPage(() => import("./pages/pps/PPSAbout"));
const PPSPricing = lazyPage(() => import("./pages/pps/PPSPricing"));
const PPSBlog = lazyPage(() => import("./pages/pps/PPSBlog"));
const PPSBlogPost = lazyPage(() => import("./pages/pps/PPSBlogPost"));
const PPSContact = lazyPage(() => import("./pages/pps/PPSContact"));

// New About Section
const OurApproach = lazyPage(() => import("./pages/pps/about/OurApproach"));

const OurImpact = lazyPage(() => import("./pages/pps/about/OurImpact"));

// New Partner Section
const PartnerWithUs = lazyPage(() => import("./pages/pps/partner/PartnerWithUs"));
const PartnerWithUsAlt = lazyPage(() => import("./pages/pps/partner/PartnerWithUsAlt"));
const IgnitePath = lazyPage(() => import("./pages/pps/partner/IgnitePath"));
const IgnitePathAlt = lazyPage(() => import("./pages/pps/partner/IgnitePathAlt"));
const AmplifyPath = lazyPage(() => import("./pages/pps/partner/AmplifyPath"));
const AmplifyPathAlt = lazyPage(() => import("./pages/pps/partner/AmplifyPathAlt"));
const EmbodyPath = lazyPage(() => import("./pages/pps/partner/EmbodyPath"));
const EmbodyPathAlt = lazyPage(() => import("./pages/pps/partner/EmbodyPathAlt"));
const EmbodyPathAltArchiveV2 = lazyPage(() => import("./pages/pps/partner/EmbodyPathAltArchiveV2"));

// NOTE: "Alt" components are now the PRIMARY pages.
// Original components are archived at -archive routes.

// IGNITE Subpages
const IgniteAssessments = lazyPage(() => import("./pages/pps/partner/ignite/IgniteAssessments"));
const IgniteMasterclasses = lazyPage(() => import("./pages/pps/partner/ignite/IgniteMasterclasses"));
const EQAssessment = lazyPage(() => import("./pages/pps/partner/ignite/EQAssessment"));
const WorkingGeniusAssessment = lazyPage(() => import("./pages/pps/partner/ignite/WorkingGeniusAssessment"));
const EQChangeLeaderMini = lazyPage(() => import("./pages/pps/EQChangeLeaderMini"));

// AMPLIFY Subpages
const AmplifyWorkshops = lazyPage(() => import("./pages/pps/partner/amplify/AmplifyWorkshops"));
import { MovedTo } from "./components/pps/MovedTo";
const StartHere = lazyPage(() => import("./pages/pps/StartHere"));
const AmplifySprints = lazyPage(() => import("./pages/pps/partner/amplify/AmplifySprints"));
const AmplifySprintsArchive = lazyPage(() => import("./pages/pps/partner/amplify/AmplifySprintsArchive"));
const AmplifyLabs = lazyPage(() => import("./pages/pps/partner/amplify/AmplifyLabs"));
const StracticalLeaderWorkshop = lazyPage(() => import("./pages/pps/partner/amplify/StracticalLeaderWorkshop"));
const StracticalLeaderCheckout = lazyPage(() => import("./pages/pps/partner/amplify/StracticalLeaderCheckout"));

// New Resources Section
const ResourcesHub = lazyPage(() => import("./pages/pps/resources/ResourcesHub"));
const FreeDownloads = lazyPage(() => import("./pages/pps/resources/FreeDownloads"));
const YouTubePage = lazyPage(() => import("./pages/pps/resources/YouTubePage"));
const AsSeenOn = lazyPage(() => import("./pages/pps/resources/AsSeenOn"));
const MediaAppearance = lazyPage(() => import("./pages/pps/resources/MediaAppearance"));
const FAQPage = lazyPage(() => import("./pages/pps/resources/FAQPage"));
const StracticalLeaderGuide = lazyPage(() => import("./pages/pps/resources/StracticalLeaderGuide"));
const StracticalMiniThankYou = lazyPage(() => import("./pages/pps/resources/StracticalMiniThankYou"));

const BurnoutResources = lazyPage(() => import("./pages/pps/resources/BurnoutResources"));
const BurnoutOptIn = lazyPage(() => import("./pages/pps/BurnoutOptIn"));

// Program Detail Pages

// About Team Hubs
const AboutAmy = lazyPage(() => import("./pages/pps/AboutAmy"));
const AboutRob = lazyPage(() => import("./pages/pps/AboutRob"));
const AboutSierra = lazyPage(() => import("./pages/pps/AboutSierra"));
const PPSOverview = lazyPage(() => import("./pages/pps/PPSOverview"));

// Blue Door: public sale retired (PPS-DEC-0017). Only the success page stays,
// for existing purchasers; every other Blue Door address redirects to the
// Epic ShIFt Organizational Appraisal (PPS-DEC-0018).

// Epic ShIFt redesign ("v3") pages ported from pps-simplified
const EnvisionShift = lazyPage(() => import("./pages/pps/v3/EnvisionShift"));
import HomeNext from "./pages/pps/v3/HomeNext";
const ArchitectShift = lazyPage(() => import("./pages/pps/v3/ArchitectShift"));
const ForIndividuals = lazyPage(() => import("./pages/pps/v3/ForIndividuals"));
const EmbodyShift = lazyPage(() => import("./pages/pps/v3/EmbodyShift"));
const ThePath = lazyPage(() => import("./pages/pps/v3/ThePath"));
const ResultsImpact = lazyPage(() => import("./pages/pps/v3/ResultsImpact"));
const AboutNext = lazyPage(() => import("./pages/pps/v3/AboutNext"));
const PhaseZeroNext = lazyPage(() => import("./pages/pps/v3/PhaseZeroNext"));

// Other Pages
const Speaking = lazyPage(() => import("./pages/pps/Speaking"));
const PressKit = lazyPage(() => import("./pages/pps/PressKit"));
const SpeakingWorkshopTopics = lazyPage(() => import("./pages/pps/SpeakingWorkshopTopics"));
const AmySpeaker = lazyPage(() => import("./pages/pps/speaking/AmySpeaker"));
const RobSpeaker = lazyPage(() => import("./pages/pps/speaking/RobSpeaker"));
const SierraSpeaker = lazyPage(() => import("./pages/pps/speaking/SierraSpeaker"));
const KickTheHabit = lazyPage(() => import("./pages/pps/KickTheHabit"));
const StoicFieldGuide = lazyPage(() => import("./pages/pps/StoicFieldGuide"));
const StoicFieldGuideAccess = lazyPage(() => import("./pages/pps/StoicFieldGuideAccess"));
const PilotTraining = lazyPage(() => import("./pages/pps/PilotTraining"));
const PilotTrainingWatch = lazyPage(() => import("./pages/pps/PilotTrainingWatch"));
const FiveDayMasterYourMessage = lazyPage(() => import("./pages/pps/FiveDayMasterYourMessage"));
const RefundRequest = lazyPage(() => import("./pages/pps/RefundRequest"));
const TeamChallenge = lazyPage(() => import("./pages/pps/TeamChallenge"));
const JournalingChallenge = lazyPage(() => import("./pages/pps/JournalingChallenge"));
const KickTheHabitWatch = lazyPage(() => import("./pages/pps/KickTheHabitWatch"));
const CommunicatorStyles = lazyPage(() => import("./pages/pps/CommunicatorStyles"));
const CommunicatorStylesWatch = lazyPage(() => import("./pages/pps/CommunicatorStylesWatch"));
const WFHSignUp = lazyPage(() => import("./pages/pps/WFHSignUp"));
const WFHThankYou = lazyPage(() => import("./pages/pps/WFHThankYou"));
const ElementsMiniSignUp = lazyPage(() => import("./pages/pps/ElementsMiniSignUp"));
const StrategicCanvasSignUp = lazyPage(() => import("./pages/pps/StrategicCanvasSignUp"));
const StrategicCanvasThankYou = lazyPage(() => import("./pages/pps/StrategicCanvasThankYou"));
const ChangeRoadmapSignUp = lazyPage(() => import("./pages/pps/ChangeRoadmapSignUp"));
const ChangeRoadmapThankYou = lazyPage(() => import("./pages/pps/ChangeRoadmapThankYou"));
const ChangeCommsSignUp = lazyPage(() => import("./pages/pps/ChangeCommsSignUp"));
const ChangeReadyTeamAssessment = lazyPage(() => import("./pages/pps/ChangeReadyTeamAssessment"));
const ChangeReadyLeaderAssessment = lazyPage(() => import("./pages/pps/ChangeReadyLeaderAssessment"));
const ElementalStyleAssessment = lazyPage(() => import("./pages/pps/ElementalStyleAssessment"));
const TeamHealthAssessment = lazyPage(() => import("./pages/pps/TeamHealthAssessment"));
const ChangeCommsThankYou = lazyPage(() => import("./pages/pps/ChangeCommsThankYou"));
const TermsAndConditions = lazyPage(() => import("./pages/pps/TermsAndConditions"));
const Sitemap = lazyPage(() => import("./pages/pps/Sitemap"));
const EasterEggForm = lazyPage(() => import("./pages/pps/EasterEggForm"));
const BrandLibrary = lazyPage(() => import("./pages/pps/BrandLibrary"));
const Unsubscribe = lazyPage(() => import("./pages/pps/Unsubscribe"));

// Admin Pages
const AdminLogin = lazyPage(() => import("./pages/pps/admin/AdminLogin"));
import AdminLayout from "./layouts/AdminLayout";
const AdminDashboard = lazyPage(() => import("./pages/pps/admin/AdminDashboard"));
const BlogPostList = lazyPage(() => import("./pages/pps/admin/BlogPostList"));
const BlogPostEditor = lazyPage(() => import("./pages/pps/admin/BlogPostEditor"));
const AdminUsers = lazyPage(() => import("./pages/pps/admin/AdminUsers"));
const MediaAppearanceList = lazyPage(() => import("./pages/pps/admin/MediaAppearanceList"));
const MediaAppearanceEditor = lazyPage(() => import("./pages/pps/admin/MediaAppearanceEditor"));
const YouTubeVideoList = lazyPage(() => import("./pages/pps/admin/YouTubeVideoList"));
const YouTubeVideoEditor = lazyPage(() => import("./pages/pps/admin/YouTubeVideoEditor"));
const AccountSettings = lazyPage(() => import("./pages/pps/admin/AccountSettings"));
const SiteVideosManager = lazyPage(() => import("./pages/pps/admin/SiteVideosManager"));
const PageStatusManager = lazyPage(() => import("./pages/pps/admin/PageStatusManager"));
const PathFinderOfferings = lazyPage(() => import("./pages/pps/admin/PathFinderOfferings"));
const PathFinderOfferingDetail = lazyPage(() => import("./pages/pps/admin/PathFinderOfferingDetail"));
const QuizRoutingRules = lazyPage(() => import("./pages/pps/admin/QuizRoutingRules"));
const BackupsManager = lazyPage(() => import("./pages/pps/admin/BackupsManager"));
const MigrateManager = lazyPage(() => import("./pages/pps/admin/MigrateManager"));
const RestoreWizard = lazyPage(() => import("./pages/pps/admin/RestoreWizard"));
const IntegrityCheck = lazyPage(() => import("./pages/pps/admin/IntegrityCheck"));
const SecretsHandoff = lazyPage(() => import("./pages/pps/admin/SecretsHandoff"));
const MigrationChecklist = lazyPage(() => import("./pages/pps/admin/MigrationChecklist"));
const SiteEmails = lazyPage(() => import("./pages/pps/admin/SiteEmails"));
const EmailOps = lazyPage(() => import("./pages/pps/admin/EmailOps"));
const ResetPassword = lazyPage(() => import("./pages/pps/admin/ResetPassword"));
const PolicyNotifications = lazyPage(() => import("./pages/pps/admin/PolicyNotifications"));
const RefundRequestsManager = lazyPage(() => import("./pages/pps/admin/RefundRequestsManager"));
const CourseLaunchManager = lazyPage(() => import("./pages/pps/admin/CourseLaunchManager"));
const SecurityFindingsExplained = lazyPage(() => import("./pages/pps/admin/SecurityFindingsExplained"));

// Legacy redirect: forward /pps/* paths to clean URLs
function LegacyPPSRedirect() {
  const path = window.location.pathname;
  if (path.startsWith('/pps')) {
    const cleanPath = path.replace(/^\/pps/, '') || '/';
    return <Navigate to={`${cleanPath}${window.location.search}${window.location.hash}`} replace />;
  }
  return <NotFound />;
}

function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;
    let cancelled = false;
    // Retry: target card/section may mount after data loads. If it never
    // appears (e.g. anchor was renamed/removed), gracefully fall back so the
    // user still lands on the correct page rather than getting a broken jump.
    // Uses findElementByFuzzyId so casing/slug differences (e.g.
    // `architect-change` vs `architectChange`) still resolve.
    const attempts = [50, 150, 350, 700, 1200, 2000];
    let found = false;
    import("@/lib/anchor-normalize").then(({ findElementByFuzzyId }) => {
      if (cancelled) return;
      attempts.forEach((delay) => {
        setTimeout(() => {
          if (cancelled || found) return;
          const el = findElementByFuzzyId(id);
          if (el) {
            found = true;
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, delay);
      });
      setTimeout(() => {
        if (cancelled || found) return;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, attempts[attempts.length - 1] + 100);
    });
    return () => { cancelled = true; };
  }, [hash, pathname]);
  return null;
}

function RouteSeoGuards() {
  const { pathname } = useLocation();

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isApiRoute = pathname === "/api" || pathname.startsWith("/api/");
  const isInternalOnlyRoute = [
    "/reset-password",
    "/unsubscribe",
    "/wfh-thank-you",
    "/thank-you-change-canvas",
    "/thank-you-change-roadmap",
    "/change-comms-thank-you",
    "/stractical-mini-thank-you",
    "/sitemap",
    "/admin/security",
  ].includes(pathname);
  const isSystemOutcomeRoute = /(thank-you|success)$/.test(pathname);
  const shouldNoIndex = isAdminRoute || isApiRoute || isInternalOnlyRoute || isSystemOutcomeRoute;

  useEffect(() => {
    if (!shouldNoIndex) return;

    const ensureMeta = (name: string, content: string) => {
      let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const ensureCanonical = (href: string) => {
      let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute("href", `${getSiteUrl()}${href}`);
    };

    ensureMeta("robots", "noindex, nofollow, noarchive, nosnippet");
    ensureCanonical(pathname);
  }, [pathname, shouldNoIndex]);

  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <ScrollToHash />
        <RouteSeoGuards />
        <Routes>
          {/* Painted Porch Strategies Routes */}
          <Route path="/" element={<PPSLayout />}>
            {/* Relaunch (plan Phase 5, PPS Admin 2026-11-05): the redesign's homepage. */}
            <Route index element={<HomeNext />} />
            <Route path="home-next" element={<Navigate to="/" replace />} />
            {/* The homepage before the relaunch, kept as an archive (Draft: admins only). */}
            <Route path="home-archive-v2" element={<PPSHome />} />
            {/* Phase Zero™: Our Approach, one page combining the old Phase Zero and Our Approach
                pages (PPS Admin, 2026-11-06). Both old pages are archived (Draft: admins only). */}
            <Route path="phase-zero" element={<PhaseZeroNext />} />
            <Route path="phase-zero-archive-v2" element={<PhaseZero />} />

            {/* Epic ShIFt draft ecosystem (v2) — not linked in nav */}

            {/* About Section */}
            {/* Relaunch: the redesign's About and Results & Impact pages. The pages
                they replace are kept as archives (Draft: admins only). */}
            <Route path="about" element={<AboutNext />} />
            <Route path="about-next" element={<Navigate to="/about" replace />} />
            <Route path="about-archive" element={<PPSAbout />} />
            <Route path="about/approach" element={<Navigate to="/phase-zero" replace />} />
            <Route path="about/approach-archive" element={<OurApproach />} />
            <Route path="about/impact" element={<ResultsImpact />} />
            <Route path="about/impact-next" element={<Navigate to="/about/impact" replace />} />
            <Route path="about/impact-archive" element={<OurImpact />} />
            
            {/* Partner Section. At the relaunch /partner gives way to The P.A.T.H. (plan §4). */}
            <Route path="partner" element={<Navigate to="/the-path" replace />} />
            <Route path="partner-archive" element={<PartnerWithUs />} />
            <Route path="partner-archive-v2" element={<PartnerWithUsAlt />} />
            
            {/* PPS-DEC-0025: the IGNITE and AMPLIFY overview pages are archived (Draft, no
                page_status row) and their addresses go to the pages visitors want. */}
            {/* The self-led, workshop and Leadership Lab pages live at top-level addresses
                (PPS-DEC-0025 amendment, PPS Admin 2026-11-06). Every old /partner address
                forwards to its new one, keeping the query and #anchor. */}
            <Route path="assessments" element={<IgniteAssessments />} />
            <Route path="assessments/working-genius" element={<WorkingGeniusAssessment />} />
            <Route path="masterclasses" element={<IgniteMasterclasses />} />
            <Route path="workshops" element={<AmplifyWorkshops />} />
            <Route path="leadership-labs" element={<AmplifyLabs />} />
            <Route path="leadership-labs/stractical-leader" element={<StracticalLeaderWorkshop />} />
            <Route path="leadership-labs/stractical-leader/enroll" element={<StracticalLeaderCheckout />} />
            <Route path="partner/ignite" element={<MovedTo to="/for-individuals" />} />
            <Route path="partner/ignite-archive-v2" element={<IgnitePathAlt />} />
            {/* Courses retired (PPS-DEC-0021): course pages go to mini courses and masterclasses */}
            <Route path="partner/ignite/courses" element={<MovedTo to="/masterclasses" />} />
            <Route path="partner/ignite/assessments" element={<MovedTo to="/assessments" />} />
            <Route path="partner/ignite/assessments/working-genius" element={<MovedTo to="/assessments/working-genius" />} />
            <Route path="partner/ignite/masterclasses" element={<MovedTo to="/masterclasses" />} />
            <Route path="eq" element={<EQAssessment />} />
            <Route path="eq-change-leader" element={<EQChangeLeaderMini />} />
            <Route path="eq-change-leader-mini" element={<Navigate to="/eq-change-leader" replace />} />
            <Route path="partner/ignite-archive" element={<IgnitePath />} />
            <Route path="partner/amplify" element={<MovedTo to="/workshops" />} />
            <Route path="partner/amplify-archive-v2" element={<AmplifyPathAlt />} />
            <Route path="partner/amplify/workshops" element={<MovedTo to="/workshops" />} />
            {/* Relaunch: Strategic Sprints are Architect ShIFt's 90-day sprint (plan §4). */}
            <Route path="partner/amplify/sprints" element={<Navigate to="/architect-shift" replace />} />
            <Route path="partner/amplify/sprints-archive" element={<AmplifySprintsArchive />} />
            <Route path="partner/amplify/sprints-archive-v2" element={<AmplifySprints />} />
            <Route path="partner/amplify/labs" element={<MovedTo to="/leadership-labs" />} />
            <Route path="partner/amplify/stractical-leader" element={<MovedTo to="/leadership-labs/stractical-leader" />} />
            <Route path="partner/amplify/stractical-leader/enroll" element={<MovedTo to="/leadership-labs/stractical-leader/enroll" />} />
            <Route path="partner/amplify-archive" element={<AmplifyPath />} />
            {/* Relaunch: EMBODY's partnership page gives way to Embody ShIFt (plan §4). */}
            <Route path="partner/embody" element={<Navigate to="/embody-shift" replace />} />
            <Route path="partner/embody-archive" element={<EmbodyPath />} />
            <Route path="partner/embody-archive-v2" element={<EmbodyPathAltArchiveV2 />} />
            <Route path="partner/embody-archive-v3" element={<EmbodyPathAlt />} />
            
            {/* Resources Section */}
            <Route path="resources" element={<ResourcesHub />} />
            <Route path="resources/free" element={<FreeDownloads />} />
            <Route path="resources/insights" element={<PPSBlog />} />
            <Route path="resources/insights/:slug" element={<PPSBlogPost />} />
            {/* Legacy /resources/blog redirects */}
            <Route path="resources/blog" element={<Navigate to="/resources/insights" replace />} />
            <Route path="resources/blog/:slug" element={<RedirectBlogToInsights />} />
            <Route path="resources/youtube" element={<YouTubePage />} />
            <Route path="speaking/media" element={<AsSeenOn />} />
            <Route path="speaking/media/:id" element={<MediaAppearance />} />
            <Route path="resources/faq" element={<FAQPage />} />
            <Route path="resources/stractical-mini" element={<StracticalLeaderGuide />} />
            <Route path="stractical-mini-thank-you" element={<StracticalMiniThankYou />} />
            
            <Route path="burnout-access" element={<BurnoutResources />} />
            <Route path="burnout" element={<BurnoutOptIn />} />
            {/* Legacy redirects */}
            <Route path="resources/burnout" element={<Navigate to="/burnout" replace />} />
            <Route path="burnout-resources-opt-in" element={<Navigate to="/burnout" replace />} />
            
            {/* Other Pages */}
            
            <Route path="speaking" element={<Speaking />} />
            <Route path="press-kit" element={<PressKit />} />
            <Route path="press" element={<Navigate to="/press-kit#press-contact" replace />} />
            <Route path="speaking/topics" element={<SpeakingWorkshopTopics />} />
            <Route path="speaking/amy" element={<AmySpeaker />} />
            <Route path="speaking/rob" element={<RobSpeaker />} />
            <Route path="speaking/sierra" element={<SierraSpeaker />} />
            <Route path="start-here" element={<StartHere />} />
            <Route path="kick-the-habit" element={<KickTheHabit />} />
            {/* The guide and the admin offerings table link here; the page lives at /kick-the-habit. */}
            <Route path="resources/kick-the-habit" element={<Navigate to="/kick-the-habit" replace />} />
            <Route path="kick-the-habit-watch" element={<KickTheHabitWatch />} />
            <Route path="stoic-field-guide" element={<StoicFieldGuide />} />
            <Route path="stoic-field-guide-access" element={<StoicFieldGuideAccess />} />
            <Route path="pilot-training" element={<PilotTraining />} />
            <Route path="pilot-training-watch" element={<PilotTrainingWatch />} />
            <Route path="6-communicator-styles" element={<CommunicatorStyles />} />
            <Route path="6-communicator-styles-watch" element={<CommunicatorStylesWatch />} />
            <Route path="talking-to-strangers" element={<FiveDayMasterYourMessage />} />
            <Route path="5-day-master-your-message-challenge" element={<Navigate to="/talking-to-strangers" replace />} />
            <Route path="team-superpowers" element={<TeamChallenge />} />
            <Route path="team-challenge" element={<Navigate to="/team-superpowers" replace />} />
            <Route path="mym-journal-challenge" element={<JournalingChallenge />} />
            <Route path="master-your-message-journal-challenge-feb2021" element={<Navigate to="/mym-journal-challenge" replace />} />
            
            <Route path="wfh-sign-up" element={<WFHSignUp />} />
            <Route path="wfh-thank-you" element={<WFHThankYou />} />
            <Route path="elements-mini" element={<ElementsMiniSignUp />} />
            <Route path="change-canvas" element={<StrategicCanvasSignUp />} />
            <Route path="thank-you-change-canvas" element={<StrategicCanvasThankYou />} />
            <Route path="change-roadmap" element={<ChangeRoadmapSignUp />} />
            <Route path="thank-you-change-roadmap" element={<ChangeRoadmapThankYou />} />
            <Route path="change-comms" element={<ChangeCommsSignUp />} />
            <Route path="change-comms-thank-you" element={<ChangeCommsThankYou />} />
            <Route path="change-ready-team-assessment" element={<ChangeReadyTeamAssessment />} />
            <Route path="change-ready-leader-assessment" element={<ChangeReadyLeaderAssessment />} />
            <Route path="elemental-style-assessment" element={<ElementalStyleAssessment />} />
            <Route path="team-health-assessment" element={<TeamHealthAssessment />} />
            {/* Legacy redirects */}
            <Route path="strategic-plan" element={<Navigate to="/change-canvas" replace />} />
            <Route path="thank-you-strategic-plan" element={<Navigate to="/thank-you-change-canvas" replace />} />
            {/* Epic ShIFt Organizational Appraisal (PPS-DEC-0018) */}
            <Route path="envision-shift" element={<EnvisionShift />} />
            {/* Relaunch (plan Phase 5): the redesign's offer pages. Always live, because
                /partner, /partner/amplify/sprints and /partner/embody redirect to them. */}
            <Route path="architect-shift" element={<ArchitectShift />} />
            <Route path="for-individuals" element={<ForIndividuals />} />
            <Route path="embody-shift" element={<EmbodyShift />} />
            <Route path="the-path" element={<ThePath />} />
            {/* Retired Blue Door addresses (PPS-DEC-0017) */}
            <Route path="blue-door" element={<Navigate to="/envision-shift" replace />} />
            <Route path="blue-door-archive" element={<Navigate to="/envision-shift" replace />} />
            <Route path="blue-door/purchase" element={<Navigate to="/envision-shift" replace />} />
            {/* Every Blue Door page and its purchase flow were removed on 2026-11-09 (PPS-DEC-0017 amendment). */}
            <Route path="blue-door/success" element={<Navigate to="/envision-shift" replace />} />
            <Route path="contact" element={<PPSContact />} />
            <Route path="terms" element={<TermsAndConditions />} />
            <Route path="privacy" element={<Navigate to="/terms?tab=privacy" replace />} />
            <Route path="cookies" element={<Navigate to="/terms?tab=cookies" replace />} />
            <Route path="sitemap" element={<Sitemap />} />
            <Route path="found-it" element={<EasterEggForm />} />
            <Route path="brand-library" element={<BrandLibrary />} />
            <Route path="unsubscribe" element={<Unsubscribe />} />
            <Route path="refund-request" element={<RefundRequest />} />
            
            {/* Legacy routes — now 301-equivalent redirects to nearest new page */}
            <Route path="for-leaders" element={<Navigate to="/start-here" replace />} />
            <Route path="for-teams" element={<Navigate to="/envision-shift" replace />} />
            <Route path="services" element={<Navigate to="/the-path" replace />} />
            <Route path="business-programs" element={<Navigate to="/the-path" replace />} />
            <Route path="programs" element={<Navigate to="/assessments" replace />} />
            {/* Course sales pages retired (PPS-DEC-0021) */}
            <Route path="radical-mindfulness" element={<Navigate to="/masterclasses" replace />} />
            <Route path="communication" element={<Navigate to="/masterclasses" replace />} />
            <Route path="extraordinary-teams" element={<Navigate to="/masterclasses" replace />} />

            {/* Quick-access redirect shortcuts */}
            <Route path="stracticalleader" element={<Navigate to="/leadership-labs/stractical-leader" replace />} />
            <Route path="blog" element={<Navigate to="/resources/insights" replace />} />
            <Route path="blog/:slug" element={<RedirectBlogToInsights />} />
            <Route path="insights" element={<Navigate to="/resources/insights" replace />} />
            <Route path="stracticalmini" element={<Navigate to="/resources/stractical-mini" replace />} />
            <Route path="media" element={<Navigate to="/speaking/media" replace />} />
            <Route path="free" element={<Navigate to="/resources/free" replace />} />
            <Route path="ignite" element={<Navigate to="/for-individuals" replace />} />
            <Route path="amplify" element={<MovedTo to="/workshops" />} />
            <Route path="embody" element={<Navigate to="/embody-shift" replace />} />
            <Route path="courses" element={<Navigate to="/masterclasses" replace />} />
            <Route path="masterclass" element={<Navigate to="/masterclasses" replace />} />
            <Route path="sprints" element={<Navigate to="/architect-shift" replace />} />
            <Route path="labs" element={<Navigate to="/leadership-labs" replace />} />
          </Route>

          {/* Link-in-Bio Hub Pages (standalone, no nav/footer).
              Wrapped in <PageGate> so an admin marking any of these Draft in
              /admin/pages still suppresses public access — these routes live
              outside PPSLayout so they don't inherit its gate. */}
          <Route path="/amy" element={<PageGate><AboutAmy /></PageGate>} />
          <Route path="/rob" element={<PageGate><AboutRob /></PageGate>} />
          <Route path="/sierra" element={<PageGate><AboutSierra /></PageGate>} />
          <Route path="/overview" element={<PageGate><PPSOverview /></PageGate>} />
          

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="posts" element={<BlogPostList />} />
            <Route path="posts/:id" element={<BlogPostEditor />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="media" element={<MediaAppearanceList />} />
            <Route path="media/:id" element={<MediaAppearanceEditor />} />
            <Route path="youtube" element={<YouTubeVideoList />} />
            <Route path="youtube/:id" element={<YouTubeVideoEditor />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="videos" element={<SiteVideosManager />} />
            <Route path="pages" element={<PageStatusManager />} />
            <Route path="backups" element={<BackupsManager />} />
            <Route path="migrate" element={<MigrateManager />} />
            <Route path="restore" element={<RestoreWizard />} />
            <Route path="verify" element={<IntegrityCheck />} />
            <Route path="secrets-handoff" element={<SecretsHandoff />} />
            <Route path="migration-checklist" element={<MigrationChecklist />} />
            <Route path="emails" element={<SiteEmails />} />
            <Route path="emails/health" element={<Navigate to="/admin/emails/queue" replace />} />
            <Route path="emails/queue" element={<EmailOps />} />
            <Route path="policy-notifications" element={<PolicyNotifications />} />
            <Route path="refunds" element={<RefundRequestsManager />} />
            <Route path="course-launches" element={<CourseLaunchManager />} />
            <Route path="offerings" element={<PathFinderOfferings />} />
            <Route path="offerings/:offeringKey" element={<PathFinderOfferingDetail />} />
            <Route path="quiz-rules" element={<QuizRoutingRules />} />
            <Route path="path-finder" element={<Navigate to="/admin/offerings" replace />} />
            <Route path="offerings-coverage" element={<Navigate to="/admin/offerings" replace />} />
            <Route path="security" element={<SecurityFindingsExplained />} />
          </Route>
          
          {/* Legacy /pps/* redirects + 404 catch-all */}
          <Route path="/pps/*" element={<LegacyPPSRedirect />} />
          <Route path="/pps" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
