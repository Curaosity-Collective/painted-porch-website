import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Copy, Download, Mic, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/pps/Eyebrow";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useToast } from "@/hooks/use-toast";
import { fetchPressAppearances } from "@/lib/press-kit";
import { mediaAppearancePath } from "@/lib/media-appearance-seo.mjs";
import speakingHero from "@/assets/heroes/speaking-hero.jpg";
import amyPhoto from "@/assets/team/amy-speaking-portrait.jpg";
import robPhoto from "@/assets/team/rob-hunter.jpg";
import sierraPhoto from "@/assets/team/sierra-ramm-cantrell.jpg";

const BIO = "Painted Porch Strategies is a change-origination practice. For more than twenty years, we've worked at the moment where leaders have the greatest leverage: before direction hardens into a plan, while there is still room to imagine, align, and architect what comes next. We build with your leaders rather than for them, expanding their capacity to author the future long after we leave.";
const SPEAKERS = [
  { name: "Amy Yackowski", role: "Founder | Chief Evolution Officer | Organizational Shift Strategist", photo: amyPhoto, href: "/speaking/amy", color: "border-primary", bio: "Amy blends Stoic philosophy, emotional intelligence, and practical change tools. For over 20 years, she has partnered with leaders and teams in staffing, energy, and healthcare to turn uncertainty into aligned action.", topics: ["Change Authorship", "Team Alignment", "Emotional Intelligence", "Stoicism at Work"] },
  { name: "Rob Hunter", role: "Chief Storytelling Officer | M.C., Master of Communication", photo: robPhoto, href: "/speaking/rob", color: "border-muted-foreground", bio: "Rob is a radio host, journalist, and storyteller with 27 years of broadcasting experience. He brings the science of messaging and the art of storytelling together to help leaders speak with impact, listen with intention, and lead with presence.", topics: ["High-Fidelity Communication", "The Power of Story", "Executive Presence"] },
  { name: "Sierra Ramm Cantrell", role: "Chief Joy Officer | M.B.A., Mind-Body Architect | Mindfulness Sherpa", photo: sierraPhoto, href: "/speaking/sierra", color: "border-gold", bio: "Sierra is a mindfulness coach, speaker, and wellness leader. For over 15 years, she has guided teams and leaders through stress, burnout, and change with simple, science-backed practices that build lasting resilience.", topics: ["Mindfulness", "Burnout Recovery", "Resilience & Well-being"] },
];
const ENGAGEMENTS = [
  { name: "ProjectWorld", logo: "/logos/projectworld.png", href: "https://www.pmbaconferences.com/" },
  { name: "Project Summit", logo: "/logos/project-summit.png", href: "https://www.pmbaconferences.com/" },
  { name: "PMBA Global", logo: "/logos/pmba-global.png", href: "https://www.pmbaconferences.com/" },
  { name: "American Staffing Association", logo: "/logos/asa.png", href: "https://americanstaffing.net/" },
  { name: "Toastmasters International", logo: "/logos/toastmasters.png", href: "https://www.toastmasters.org/" },
  { name: "NextUp Phoenix", logo: "/logos/nextup-phoenix.png", href: "https://www.nextupisnow.org/regions/phoenix/" },
];
const H2 = "font-poppins font-semibold text-3xl md:text-4xl text-navy leading-tight";
const SECTION = "container max-w-7xl mx-auto px-6 py-16 md:py-20";

export default function PressKit() {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(6);
  const { toast } = useToast();
  const { data: appearances = [], isLoading, isError, refetch } = useQuery({ queryKey: ["press-kit-appearances"], queryFn: fetchPressAppearances });
  useDocumentSeo({ title: "Press Kit | Painted Porch Strategies", description: "Painted Porch Strategies bios, mission, speaking engagements, approved media appearances, press contact, and downloadable press kit.", ogImage: speakingHero, robots: "index, follow" });

  async function copyBio() {
    try {
      await navigator.clipboard.writeText(BIO);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy the bio", description: "Please select and copy the text directly.", variant: "destructive" });
    }
  }

  return (
    <div className="bg-background text-foreground">
      <TierHeroSection customBadge={<Eyebrow tone="gold">Press & Speaking</Eyebrow>}
        headline={<>Painted Porch Strategies<span className="block text-2xl md:text-3xl font-medium mt-4">Press Kit</span></>}
        description="The people, purpose, and voices behind extraordinary teams and Epic ShIFt."
        background={{ type: "image", src: speakingHero }} overlayClass="bg-navy/70" textBoxClass="!p-0" minHeightClass="min-h-[60vh]"
        ctas={[]} />

      <nav aria-label="Press kit sections" className="border-b border-border">
        <div className="container max-w-7xl mx-auto px-6 py-5 flex flex-wrap gap-x-8 gap-y-3 font-semibold text-primary">
          {[['bio', 'Our Bio'], ['mission', 'Our Mission'], ['speakers', 'Our Speakers'], ['engagements', 'Speaking Engagements'], ['media', 'Media Appearances'], ['press-contact', 'Press Contact']].map(([id, label]) => <a key={id} href={`#${id}`} className="hover:underline focus-visible:ring-2 focus-visible:ring-primary">{label}</a>)}
          <Button asChild variant="outline" className="gap-2"><a href="/downloads/painted-porch-strategies-press-kit.pdf" download="painted-porch-strategies-press-kit.pdf"><Download className="h-4 w-4" />Download Press Kit PDF</a></Button>
        </div>
      </nav>

      <section id="bio" aria-labelledby="bio-heading" className={SECTION}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div><Eyebrow tone="teal">About the Practice</Eyebrow><h2 id="bio-heading" className={H2}>Our Bio</h2></div>
          <div className="lg:col-span-2"><p className="text-lead leading-relaxed mb-6">{BIO}</p>
            <Button variant="outline" onClick={copyBio} className="gap-2">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy Bio"}</Button>
          </div>
        </div>
      </section>

      <section id="mission" aria-labelledby="mission-heading" className="bg-primary/10 border-y border-primary/20">
        <div className={SECTION}><Eyebrow tone="teal">Our Mission</Eyebrow><h2 id="mission-heading" className={`${H2} max-w-4xl`}>Extraordinary Teams. Epic <span>Sh<span className="text-primary">IF</span>t™.</span></h2>
          <p className="text-lead max-w-4xl mt-6">Everything we do serves one purpose: developing extraordinary teams who can do epic shIFt and carry the mission further than any single leader could.</p>
          <p className="text-body max-w-4xl mt-5">We look at leadership and culture, systems and workflows, and the human capacity underneath both. Grounded in Stoic wisdom and driven by emotional intelligence, we help leaders imagine, align, and author what comes next.</p>
        </div>
      </section>

      <section id="speakers" aria-labelledby="speakers-heading" className={SECTION}>
        <Eyebrow tone="purple">The Voices of the Porch</Eyebrow><h2 id="speakers-heading" className={H2}>Meet Our Speakers</h2>
        <div className="grid gap-8 md:grid-cols-3 mt-10">
          {SPEAKERS.map((speaker) => <article key={speaker.name} className={`border-t-4 ${speaker.color} pt-6 flex flex-col items-start`}>
            <img src={speaker.photo} alt={speaker.name} width={160} height={160} loading="lazy" className="w-40 h-40 rounded-full object-cover" />
            <h3 className="font-poppins text-2xl font-semibold text-navy mt-6">{speaker.name}</h3>
            <p className="text-body-sm text-primary font-semibold mt-2">{speaker.role}</p>
            <p className="text-body mt-4">{speaker.bio}</p>
            <ul className="text-body text-foreground list-disc pl-5 space-y-1 mb-2 mt-4">{speaker.topics.map((topic) => <li className="text-body" key={topic}>{topic}</li>)}</ul>
            <div className="flex flex-wrap gap-3 mt-auto pt-6">
              <Button variant="outline" size="sm" asChild><Link to={speaker.href}>Full Bio & Topics <ArrowRight className="ml-2 w-4 h-4" /></Link></Button>
              <Button variant="ghost" size="sm" asChild><a href={speaker.photo} download={`${speaker.name.toLowerCase().replace(/ /g, '-')}-headshot.jpg`}><Download className="mr-2 w-4 h-4" />Headshot</a></Button>
            </div>
          </article>)}
        </div>
      </section>

      <section id="engagements" aria-labelledby="engagements-heading" className="bg-muted/50 border-y border-border">
        <div className={SECTION}><Eyebrow tone="teal">On Stage</Eyebrow><h2 id="engagements-heading" className={H2}>Selected Speaking Engagements</h2>
          <p className="text-body mt-5 max-w-3xl">Our team has spoken for conferences, associations, and organizations including:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10 mt-10">{ENGAGEMENTS.map((event) => <a key={event.name} href={event.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-4 text-center text-navy font-semibold hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"><img src={event.logo} alt="" loading="lazy" className="h-20 w-full max-w-48 object-contain" /><span>{event.name}</span></a>)}</div>
          <Button asChild variant="outline" className="mt-10"><Link to="/speaking/topics">Explore Speaking Topics <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section id="media" aria-labelledby="media-heading" className={SECTION}>
        <Eyebrow tone="raspberry">In the Conversation</Eyebrow><h2 id="media-heading" className={H2}>Media Appearances</h2>
        <p className="text-body mt-5 mb-8">Podcasts, interviews, articles, and conversations featuring the Painted Porch Strategies team.</p>
        {isLoading ? <p className="text-body" role="status">Loading appearances…</p> : isError ? <div role="alert"><p className="text-body mb-4">Media appearances could not be loaded.</p><Button variant="outline" onClick={() => refetch()}>Try Again</Button></div> : appearances.length === 0 ? <p className="text-body">No media appearances are available yet.</p> : <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{appearances.slice(0, visible).map((appearance) => <Link key={appearance.id} to={mediaAppearancePath(appearance.id)} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card hover:border-primary focus-visible:ring-2 focus-visible:ring-primary">
            <div className="relative aspect-video bg-primary/10 flex items-center justify-center"><Mic className="h-12 w-12 text-primary" />{appearance.thumbnail_url && <img src={appearance.thumbnail_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.hidden = true; }} />}</div>
            <div className="p-5 flex flex-col flex-1"><span className="text-primary font-semibold text-sm">{appearance.show_name}</span><h3 className="font-poppins text-xl font-semibold text-navy mt-2 group-hover:text-primary">{appearance.title}</h3>
              {appearance.description && <p className="text-body-sm mt-3 line-clamp-3">{appearance.description}</p>}
              <div className="mt-auto pt-5 flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">{appearance.appearance_date && <time dateTime={appearance.appearance_date}>{new Date(`${appearance.appearance_date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>}<span className="capitalize">{appearance.media_type}</span></div>
            </div>
          </Link>)}</div>
          <div className="mt-8 flex flex-wrap gap-4">{visible < appearances.length && <Button variant="outline" onClick={() => setVisible((count) => count + 6)}>Show More Appearances</Button>}<Button variant="ghost" asChild><Link to="/speaking/media">View As Seen On <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
        </>}
      </section>
      <section id="press-contact" aria-labelledby="press-contact-heading" className="bg-muted/50 border-y border-border">
        <div className={SECTION}><Eyebrow tone="teal">Press Inquiries</Eyebrow><h2 id="press-contact-heading" className={H2}>Press Contact</h2>
          <p className="text-lead mt-5">Painted Porch Strategies Team</p>
          <p className="text-body mt-3 max-w-3xl">For interviews, speaking opportunities, speaker photos, or additional press materials, contact our team.</p>
          <div className="flex flex-wrap gap-4 mt-6"><Button asChild className="gap-2"><Link to="/contact?interest=speaking"><MessageSquare className="h-4 w-4" />Contact Us</Link></Button><Button asChild variant="outline" className="gap-2"><a href="/downloads/painted-porch-strategies-press-kit.pdf" download="painted-porch-strategies-press-kit.pdf"><Download className="h-4 w-4" />Download Press Kit PDF</a></Button></div>
        </div>
      </section>
      <ParallaxCTA backgroundImage={speakingHero} overlayTone="purple" eyebrow="Press & Speaking Inquiries" headline="Bring the Porch to Your Audience" description="For interviews, speaking opportunities, or additional press materials, get in touch with our team." actions={[{ label: "Contact Us", to: "/contact?interest=speaking", variant: "primary" }]} />
    </div>
  );
}