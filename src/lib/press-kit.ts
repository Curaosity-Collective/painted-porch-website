import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type PressAppearance = Tables<"media_appearances">;

export function approvedPressAppearances(records: PressAppearance[]) {
  return records.filter((record) => record.review_status === "published");
}

export async function fetchPressAppearances() {
  const { data, error } = await supabase
    .from("media_appearances")
    .select("*")
    .eq("review_status", "published")
    .order("featured", { ascending: false })
    .order("appearance_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return approvedPressAppearances(data ?? []);
}