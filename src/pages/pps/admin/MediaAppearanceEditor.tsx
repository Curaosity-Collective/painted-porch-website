import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Upload, ExternalLink, Sparkles, Loader2, X, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  title: string;
  color: string | null;
}

export default function MediaAppearanceEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isNew = id === "new";

  const [mediaType, setMediaType] = useState("podcast");
  const [showName, setShowName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [appearanceDate, setAppearanceDate] = useState("");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [aeoTags, setAeoTags] = useState<string[]>([]);
  const [geoTags, setGeoTags] = useState<string[]>([]);
  const [tagInputs, setTagInputs] = useState({ seo: "", aeo: "", geo: "" });

  const [pasteUrl, setPasteUrl] = useState("");
  const [autofilling, setAutofilling] = useState(false);

  const handleAutofill = async () => {
    const link = pasteUrl.trim();
    if (!/^https?:\/\//i.test(link)) {
      toast({ title: "Paste a full link", description: "It should start with https://", variant: "destructive" });
      return;
    }
    setAutofilling(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-media-metadata", { body: { url: link } });
      if (error) {
        let detail = error.message;
        const ctx = (error as { context?: Response }).context;
        if (ctx?.text) {
          const raw = await ctx.text();
          try { detail = JSON.parse(raw).error || raw; } catch { detail = raw || detail; }
        }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      setExternalUrl(data.external_url || link);
      if (data.title) setTitle(data.title);
      if (data.show_name) setShowName(data.show_name);
      if (data.media_type) setMediaType(data.media_type);
      if (data.appearance_date) setAppearanceDate(data.appearance_date);
      if (data.description) setDescription(data.description);
      if (data.thumbnail_url) setThumbnailUrl(data.thumbnail_url);
      setSeoTitle(data.seo_title || "");
      setSeoDescription(data.seo_description || "");
      setSeoKeywords(data.seo_keywords || []);
      setAeoTags(data.aeo_tags || []);
      setGeoTags(data.geo_tags || []);
      if (data.category_ids?.length) setSelectedCategoryIds(data.category_ids);
      toast({
        title: "Details filled in",
        description: data.appearance_date
          ? "Review everything before saving."
          : "Review everything before saving. No publish date was found, so add it by hand.",
      });
    } catch (err) {
      toast({
        title: "Could not read that link",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setAutofilling(false);
    }
  };

  const addTag = (key: "seo" | "aeo" | "geo", list: string[], setList: (v: string[]) => void) => {
    const v = tagInputs[key].trim();
    if (v && !list.includes(v)) setList([...list, v]);
    setTagInputs((t) => ({ ...t, [key]: "" }));
  };



  useEffect(() => {
    supabase.from("blog_categories").select("id, title, color").order("title").then(({ data }) => {
      setAllCategories(data || []);
    });
  }, []);

  useEffect(() => {
    if (isNew || !user) return;
    const load = async () => {
      const { data } = await supabase.from("media_appearances").select("*").eq("id", id).single();
      if (data) {
        setMediaType(data.media_type);
        setShowName(data.show_name);
        setTitle(data.title);
        setDescription(data.description || "");
        setThumbnailUrl(data.thumbnail_url || "");
        setExternalUrl(data.external_url || "");
        setAppearanceDate(data.appearance_date || "");
        setFeatured(data.featured);
        setSeoTitle(data.seo_title || "");
        setSeoDescription(data.seo_description || "");
        setSeoKeywords(data.seo_keywords || []);
        setAeoTags(data.aeo_tags || []);
        setGeoTags(data.geo_tags || []);
      }
      const { data: links } = await supabase.from("media_appearance_categories").select("category_id").eq("appearance_id", id!);
      setSelectedCategoryIds((links || []).map((l) => l.category_id));
    };
    load();
  }, [id, isNew, user]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `media-appearances/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
      setThumbnailUrl(urlData.publicUrl);
    }
    setUploading(false);
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !showName.trim()) {
      toast({ title: "Title and Show Name are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      media_type: mediaType as any,
      show_name: showName,
      title,
      description: description || null,
      thumbnail_url: thumbnailUrl || null,
      external_url: externalUrl || null,
      appearance_date: appearanceDate || null,
      featured,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      seo_keywords: seoKeywords,
      aeo_tags: aeoTags,
      geo_tags: geoTags,
      updated_at: new Date().toISOString(),
    };

    let appearanceId = id;

    if (isNew) {
      const { data, error } = await supabase.from("media_appearances").insert(payload).select("id").single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      appearanceId = data.id;
    } else {
      const { error } = await supabase.from("media_appearances").update(payload).eq("id", id!);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    // Sync categories
    await supabase.from("media_appearance_categories").delete().eq("appearance_id", appearanceId!);
    if (selectedCategoryIds.length > 0) {
      await supabase.from("media_appearance_categories").insert(
        selectedCategoryIds.map((cid) => ({ appearance_id: appearanceId!, category_id: cid }))
      );
    }

    toast({ title: isNew ? "Created!" : "Saved!" });
    setSaving(false);
    navigate("/admin/media");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/media")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {externalUrl && !isNew && (
              <Button variant="outline" size="sm" onClick={() => window.open(externalUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-1" /> View on Website
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Paste-a-link autofill */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Link2 className="h-4 w-4" /> Fill in from a link
              </label>
              <p className="text-xs text-muted-foreground">
                Paste a podcast, YouTube, article, or event link. We will fill in the title, show, date,
                description, thumbnail, SEO / AEO / GEO tags, and categories for you to review.
              </p>
              <div className="flex gap-2">
                <Input
                  value={pasteUrl}
                  onChange={(e) => setPasteUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAutofill())}
                  placeholder="https://..."
                  disabled={autofilling}
                />
                <Button onClick={handleAutofill} disabled={autofilling || !pasteUrl.trim()} size="sm" className="shrink-0">
                  {autofilling ? (
                    <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Reading…</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-1" /> Auto-fill</>
                  )}
                </Button>
              </div>
              {!isNew && (
                <p className="text-xs text-muted-foreground">This will replace the fields below. Nothing is saved until you click Save.</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Appearance title" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Show / Publication Name *</label>
              <Input value={showName} onChange={(e) => setShowName(e.target.value)} placeholder="e.g. The Change Management Show" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">External URL</label>
              <Input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://..." />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Thumbnail Image</label>
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt="Thumbnail" className="w-full max-w-sm aspect-[16/9] object-cover rounded-lg mb-3" />
              )}
              <div className="flex gap-3 items-center">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                  <Button variant="outline" size="sm" asChild disabled={uploading}>
                    <span><Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload Image"}</span>
                  </Button>
                </label>
                <span className="text-xs text-muted-foreground">or paste URL:</span>
                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
              </div>
            </div>

            {/* SEO / AEO / GEO */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-4">
              <h3 className="text-sm font-semibold">SEO / AEO / GEO</h3>
              <div>
                <label className="text-sm font-medium mb-1.5 block">SEO Title</label>
                <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title} />
                <p className="text-xs text-muted-foreground mt-1">{(seoTitle || title).length}/60 characters</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Meta Description</label>
                <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} />
                <p className="text-xs text-muted-foreground mt-1">{seoDescription.length}/160 characters</p>
              </div>
              {([
                { key: "seo", label: "Keywords", list: seoKeywords, set: setSeoKeywords, placeholder: "Add keyword" },
                { key: "aeo", label: "AEO Questions", list: aeoTags, set: setAeoTags, placeholder: "Add a question this answers" },
                { key: "geo", label: "GEO Tags", list: geoTags, set: setGeoTags, placeholder: "e.g. United States" },
              ] as const).map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-medium mb-1.5 block">{f.label}</label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInputs[f.key]}
                      onChange={(e) => setTagInputs((t) => ({ ...t, [f.key]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(f.key, f.list, f.set))}
                      placeholder={f.placeholder}
                    />
                    <Button size="sm" variant="outline" onClick={() => addTag(f.key, f.list, f.set)}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {f.list.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => f.set(f.list.filter((t) => t !== tag))}
                      >
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Media Type</label>
              <Select value={mediaType} onValueChange={setMediaType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="panel">Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Appearance Date</label>
              <Input type="date" value={appearanceDate} onChange={(e) => setAppearanceDate(e.target.value)} />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={featured} onCheckedChange={(v) => setFeatured(!!v)} />
                <span className="text-sm font-medium">Featured</span>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Categories</label>
              <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto border border-border rounded-lg p-2">
                {allCategories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedCategoryIds.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                    {cat.title}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
