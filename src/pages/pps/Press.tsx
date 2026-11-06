import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/pps/Eyebrow";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { PressInquiryForm } from "@/components/pps/PressInquiryForm";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import speakingHero from "@/assets/heroes/speaking-hero.jpg";
export default function Press() {
  useDocumentSeo({ title: "Press & Media Relations | Painted Porch Strategies", description: "Contact Painted Porch Strategies Media Relations for interviews, speaking engagements, speaker photos and press materials.", ogImage: speakingHero, robots: "index, follow" });
  return <div className="bg-background text-foreground"><TierHeroSection customBadge={<Eyebrow tone="gold">Press & Media</Eyebrow>} headline={<>Painted Porch Strategies<span className="block text-2xl md:text-3xl font-medium mt-4">Media Relations</span></>} description="Interviews, speaking opportunities, and the voices behind extraordinary teams and Epic ShIFt." background={{ type: "image", src: speakingHero }} overlayClass="bg-navy/70" textBoxClass="!p-0" minHeightClass="min-h-[60vh]" ctas={[]} />
    <section className="container max-w-7xl mx-auto px-6 py-16 md:py-20"><div className="grid gap-12 lg:grid-cols-2"><div><Eyebrow tone="teal">Press Contact</Eyebrow><h2 className="font-poppins font-semibold text-3xl md:text-4xl text-navy">Media Relations</h2><p className="text-lead mt-5">Painted Porch Strategies</p><p className="text-body mt-3 break-words">speaking@onthepaintedporch.com</p><p className="text-body mt-6 max-w-xl">For interviews, speaking opportunities, speaker photos, or additional press materials, reach out to our team.</p><div className="flex flex-wrap gap-4 mt-8"><Button asChild variant="outline"><Link to="/press-kit">View Press Kit <ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild variant="outline"><a href="/downloads/painted-porch-strategies-press-kit.pdf" download><Download className="mr-2 h-4 w-4" />Press Kit PDF</a></Button></div></div><div id="inquiry" className="scroll-mt-24"><h2 className="font-poppins font-semibold text-2xl text-navy mb-6">Send a Press Inquiry</h2><PressInquiryForm source="/press" /></div></div></section>
    <ParallaxCTA backgroundImage={speakingHero} overlayTone="teal" eyebrow="Our Speakers" headline="Meet the Voices of the Porch" description="Amy Yackowski, Rob Hunter, and Sierra Ramm Cantrell." actions={[{ label: "Explore Speaking", to: "/speaking", variant: "primary" }]} /></div>;
}