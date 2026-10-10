import { useState } from "react";
import { Loader2, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/** Scans the Painted Porch channel + YouTube search. New items arrive as Pending. */
export function ScanYouTubeButton({ onDone }: { onDone?: () => void }) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const run = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("scan-youtube-channel", { body: {} });
    setBusy(false);
    if (error || data?.error) {
      toast({ title: "Scan failed", description: data?.error || error?.message, variant: "destructive" });
      return;
    }
    toast({
      title: "YouTube scan complete",
      description: `${data.videos_added} new channel video(s) and ${data.appearances_added} possible appearance(s) added as Pending.`,
    });
    onDone?.();
  };

  return (
    <Button size="sm" variant="outline" onClick={run} disabled={busy}>
      {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Youtube className="h-4 w-4 mr-1" />}
      Scan YouTube
    </Button>
  );
}

export function ReviewStatusBadge({ status }: { status: string }) {
  if (status !== "pending") return null;
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-secondary px-2 py-0.5 text-caption font-semibold text-secondary">
      Pending
    </span>
  );
}
