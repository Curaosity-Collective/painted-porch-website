import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Launch status of every masterclass and mini course: the course_launch_status rows whose slug
 * starts with "mc-" (the Masterclasses page's launchSlug values). Returns null while loading.
 * A failed read resolves to an empty map, which callers treat as "nothing has launched yet".
 */
export function useMasterclassLaunchStatuses(): Map<string, string> | null {
  const [statuses, setStatuses] = useState<Map<string, string> | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.from("course_launch_status").select("slug, status").like("slug", "mc-%");
      if (!active) return;
      setStatuses(
        new Map((data ?? []).map((r: { slug: string; status: string | null }) => [r.slug, r.status ?? ""])),
      );
    })();
    return () => {
      active = false;
    };
  }, []);
  return statuses;
}

/** True once any masterclass or mini course is live; null while the statuses load. */
export function anyMasterclassLive(statuses: Map<string, string> | null): boolean | null {
  if (!statuses) return null;
  return [...statuses.values()].some((s) => s === "live");
}
