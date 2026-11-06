import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, Users, Mic, BookOpen, Flame, Rocket, Building, Download, Video, ArrowRight, PenLine } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchEntry {
  title: string;
  description: string;
  href: string;
  category: string;
  keywords: string[];
  icon: React.ReactNode;
}

const searchIndex: SearchEntry[] = [
  // Main pages
  { title: "Home", description: "Welcome to Painted Porch Strategies", href: "/", category: "Pages", keywords: ["home", "main", "landing", "painted porch"], icon: <Building className="w-4 h-4" /> },
  { title: "Find Your Next ShIFt", description: "A three-minute directional guide to your best starting point", href: "/start-here", category: "Pages", keywords: ["quiz", "guide", "find your next shift", "start", "quiz", "pathway", "path", "begin", "assessment", "blue door"], icon: <ArrowRight className="w-4 h-4" /> },
  { title: "Contact Us", description: "Get in touch with us", href: "/contact", category: "Pages", keywords: ["contact", "call", "schedule", "email", "phone", "reach out"], icon: <FileText className="w-4 h-4" /> },
  { title: "Speaking", description: "Book Amy for keynotes, workshops, and events", href: "/speaking", category: "Pages", keywords: ["speaking", "keynote", "event", "workshop", "conference", "presenter"], icon: <Mic className="w-4 h-4" /> },

  // About
  { title: "Our Approach", description: "Phase Zero: how we work, the Painted Porch Pillars, and how we think", href: "/phase-zero", category: "About", keywords: ["approach", "phase zero", "path", "philosophy", "stoic", "methodology", "framework"], icon: <BookOpen className="w-4 h-4" /> },
  
  { title: "Our Impact", description: "Client results, testimonials, and partner logos", href: "/about/impact", category: "About", keywords: ["impact", "results", "testimonials", "clients", "partners", "case study", "success"], icon: <FileText className="w-4 h-4" /> },

  // The P.A.T.H. and the offers. IGNITE, AMPLIFY and EMBODY are no longer shown publicly
  // (PPS-DEC-0025); they stay as keywords so a search for an old name still lands.
  { title: "The P.A.T.H.", description: "The four stages of change and the three ShIFts", href: "/the-path", category: "Partnership", keywords: ["path", "partner", "partnership", "stages", "work with", "collaborate", "ignite", "amplify", "embody"], icon: <Building className="w-4 h-4" /> },
  { title: "Envision ShIFt", description: "The Epic ShIFt Organizational Appraisal and your P.A.T.H. Compass", href: "/envision-shift", category: "Partnership", keywords: ["envision", "appraisal", "compass", "organizational 360", "readiness", "blue door"], icon: <Building className="w-4 h-4" /> },
  { title: "Architect ShIFt", description: "Author the direction together and fortify what needs to hold first", href: "/architect-shift", category: "Partnership", keywords: ["architect", "sprint", "sprints", "intensive", "strategy", "authorship"], icon: <Building className="w-4 h-4" /> },
  { title: "Embody ShIFt", description: "Ongoing advisory while your organization leads the change", href: "/embody-shift", category: "Partnership", keywords: ["embody", "advisory", "embedded", "enterprise", "c-suite", "executive", "transformation"], icon: <Building className="w-4 h-4" /> },
  { title: "Assessments", description: "DISC, EQ, and Working Genius assessments", href: "/assessments", category: "Partnership", keywords: ["assessments", "disc", "eq", "emotional intelligence", "working genius", "personality", "self-led", "ignite"], icon: <Flame className="w-4 h-4" /> },
  { title: "Masterclasses", description: "Focused skill-building masterclasses and mini courses", href: "/masterclasses", category: "Partnership", keywords: ["masterclass", "mini course", "skill", "session", "mindfulness", "habit", "journaling", "meditation", "self-led", "ignite"], icon: <Flame className="w-4 h-4" /> },
  { title: "Team Workshops", description: "Facilitated team workshops for alignment and growth", href: "/workshops", category: "Partnership", keywords: ["workshops", "facilitated", "team", "alignment", "amplify"], icon: <Rocket className="w-4 h-4" /> },
  { title: "Leadership Labs", description: "Cohort-based labs for leaders who want depth", href: "/leadership-labs", category: "Partnership", keywords: ["labs", "cohort", "leadership", "peer", "stractical", "amplify"], icon: <Rocket className="w-4 h-4" /> },

  // Resources
  { title: "Resources Hub", description: "All resources, tools, and content in one place", href: "/resources", category: "Resources", keywords: ["resources", "tools", "content", "library"], icon: <BookOpen className="w-4 h-4" /> },
  { title: "Free Resources", description: "Free guides, templates, and frameworks", href: "/resources/free", category: "Resources", keywords: ["free", "downloads", "guides", "templates", "frameworks", "pdf", "white paper", "resources"], icon: <Download className="w-4 h-4" /> },
  { title: "Insights", description: "Thoughts from the Porch, articles and insights", href: "/resources/insights", category: "Resources", keywords: ["insights", "blog", "articles", "thoughts", "porch", "writing", "post"], icon: <FileText className="w-4 h-4" /> },
  { title: "YouTube", description: "Video content and tutorials", href: "/resources/youtube", category: "Resources", keywords: ["youtube", "video", "tutorials", "watch"], icon: <Video className="w-4 h-4" /> },
  { title: "As Seen On", description: "Media appearances, podcasts, and features", href: "/speaking/media", category: "Speaking", keywords: ["media", "podcast", "appearances", "features", "press", "seen on"], icon: <FileText className="w-4 h-4" /> },

  // Concepts (searchable topics that link to relevant pages)
  { title: "Phase Zero", description: "The work before the work: Prepare and Align", href: "/phase-zero", category: "Concepts", keywords: ["phase zero", "before implementation", "preparation", "readiness", "strategic authorship"], icon: <BookOpen className="w-4 h-4" /> },
  { title: "P.A.T.H. Framework", description: "Prepare → Align → Take Off → Habits", href: "/the-path", category: "Concepts", keywords: ["path", "prepare", "align", "take off", "habit", "framework", "methodology"], icon: <BookOpen className="w-4 h-4" /> },
  { title: "The Painted Porch Pillars", description: "Cultural Cornerstone, Operational Frame, Living Ecosystem", href: "/phase-zero#pillars", category: "Concepts", keywords: ["pillars", "cultural", "operational", "living ecosystem", "architecture", "adaptability"], icon: <BookOpen className="w-4 h-4" /> },
  { title: "Change Management", description: "Organizational transformation and shift strategies", href: "/phase-zero", category: "Concepts", keywords: ["change management", "transformation", "shift", "organizational change", "transition", "adoption"], icon: <BookOpen className="w-4 h-4" /> },
];

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Published blog posts, loaded once the dialog is opened
  const { data: blogEntries = [] } = useQuery<SearchEntry[]>({
    queryKey: ["site-search-blog-posts"],
    enabled: open,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt")
        .eq("status", "published")
        .order("publish_date", { ascending: false })
        .limit(200);

      return (data || [])
        .filter((p) => p.slug)
        .map((p) => ({
          title: p.title,
          description: p.excerpt?.slice(0, 120) || "Thoughts from the Porch",
          href: `/resources/insights/${p.slug}`,
          category: "Insights",
          keywords: ["blog", "insight", "article", "post", p.title.toLowerCase()],
          icon: <PenLine className="w-4 h-4" />,
        }));
    },
  });


  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      navigate(href);
    },
    [navigate]
  );

  // Routes excluded from search indexing and autocomplete.
  // /burnout-access is gated behind the /burnout opt-in flow and must never appear
  // as a standalone search result.
  const EXCLUDED_HREFS = useMemo(() => new Set(["/burnout-access"]), []);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, SearchEntry[]> = {};
    [...searchIndex, ...blogEntries]
      .filter((entry) => !EXCLUDED_HREFS.has(entry.href))
      .forEach((entry) => {
        if (!groups[entry.category]) groups[entry.category] = [];
        groups[entry.category].push(entry);
      });
    return groups;
  }, [EXCLUDED_HREFS, blogEntries]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        aria-label="Search site"
      >
        <Search className="w-5 h-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, resources, concepts..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedEntries).map(([category, entries]) => (
            <CommandGroup key={category} heading={category}>
              {entries.map((entry) => (
                <CommandItem
                  key={entry.href + entry.title}
                  value={`${entry.title} ${entry.description} ${entry.keywords.join(" ")}`}
                  onSelect={() => handleSelect(entry.href)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-primary">{entry.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{entry.title}</span>
                    <span className="text-xs text-muted-foreground">{entry.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
