import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { buildMediaAppearancePage, type MediaSeoRecord } from "@/lib/media-appearance-seo.mjs";

export default function MediaAppearance() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["media-appearance", id],
    queryFn: async () => {
      if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
      const { data, error } = await supabase.from("media_appearances")
        .select("*,media_appearance_categories(blog_categories(title))")
        .eq("id", id).eq("review_status", "published").maybeSingle();
      if (error) throw error;
      return data as MediaSeoRecord | null;
    },
  });
  const seo = useMemo(() => data ? buildMediaAppearancePage(data) : null, [data]);
  useDocumentSeo(seo ? { ...seo, robots: "index, follow" } : {
    title: "Media appearance | Painted Porch Strategies", robots: "noindex, follow",
  });
  return (
    <section className="bg-background py-12 md:py-20">
      <div className="container max-w-4xl px-6">
        <Button asChild variant="ghost" className="mb-8"><Link to="/speaking/media"><ArrowLeft className="mr-2 h-4 w-4" />As Seen On</Link></Button>
        {isLoading ? <p className="text-body text-muted-foreground" role="status">Loading appearance...</p> : isError ?
          <p className="text-body">This appearance could not be loaded. Please try again.</p> : !data ?
          <><h1 className="font-poppins text-3xl font-semibold text-navy">Appearance unavailable</h1><p className="text-body mt-4">This appearance is not currently published.</p></> : <article>
            <p className="text-caption font-semibold text-primary mb-3">{data.show_name}</p>
            <h1 className="font-poppins text-3xl md:text-4xl font-semibold text-navy break-words">{data.title}</h1>
            {data.appearance_date && <p className="text-caption text-muted-foreground mt-4"><time dateTime={data.appearance_date}>{new Date(`${data.appearance_date.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time></p>}
            {data.thumbnail_url && <img src={data.thumbnail_url} alt={data.title} className="w-full aspect-video object-contain bg-muted mt-8 rounded-lg" />}
            {data.description && <p className="text-lead text-foreground mt-8 whitespace-pre-line">{data.description}</p>}
            <div className="flex flex-wrap gap-2 mt-6">{data.media_appearance_categories?.map((link) => link.blog_categories?.title).filter(Boolean).map((title) => <span key={title} className="text-caption text-primary bg-primary/10 px-3 py-1 rounded-md">{title}</span>)}</div>
            {data.external_url && <Button asChild className="mt-8"><a href={data.external_url} target="_blank" rel="noopener noreferrer">View on {data.show_name || "original publication"}<ExternalLink className="ml-2 h-4 w-4" /></a></Button>}
          </article>}
      </div>
    </section>
  );
}