import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Scans the Painted Porch YouTube channel (new uploads -> youtube_videos) and
// YouTube search for Amy on other channels (-> media_appearances). Everything
// new lands as review_status = 'pending' for admin approval.

const CHANNEL_HANDLE = "onthepaintedporch";
const SEARCH_QUERIES = ['"Amy Yackowski"', '"Painted Porch Strategies"'];
const MATCH = /yackowski|painted porch/i;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const [h, mi, s] = [m[1], m[2], m[3]].map((x) => parseInt(x || "0"));
  return h > 0 ? `${h}:${String(mi).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${mi}:${String(s).padStart(2, "0")}`;
}

async function yt(path: string, key: string) {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}&key=${key}`);
  if (!res.ok) throw new Error(`YouTube ${path.split("?")[0]} failed (${res.status})`);
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return json({ error: "Unauthorized" }, 401);
  const { data: ok } = await userClient.rpc("is_admin_or_editor", { _user_id: u.user.id });
  if (!ok) return json({ error: "Forbidden" }, 403);

  const key = Deno.env.get("YOUTUBE_API_KEY");
  if (!key) return json({ error: "YouTube key not configured" }, 500);
  const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    // 1. Own channel uploads
    const ch = await yt(`channels?forHandle=@${CHANNEL_HANDLE}&part=id,snippet`, key);
    const channelId: string | undefined = ch.items?.[0]?.id;
    if (!channelId) return json({ error: "Could not find the channel" }, 404);

    const uploadIds: string[] = [];
    let page = "";
    do {
      const d = await yt(`playlistItems?playlistId=UU${channelId.slice(2)}&part=contentDetails&maxResults=50${page ? `&pageToken=${page}` : ""}`, key);
      for (const it of d.items || []) if (it.contentDetails?.videoId) uploadIds.push(it.contentDetails.videoId);
      page = d.nextPageToken || "";
    } while (page && uploadIds.length < 200);

    // 2. Appearances on other channels
    const searchIds = new Set<string>();
    for (const q of SEARCH_QUERIES) {
      const d = await yt(`search?part=snippet&type=video&maxResults=25&q=${encodeURIComponent(q)}`, key);
      for (const it of d.items || []) {
        if (it.snippet?.channelId !== channelId && it.id?.videoId) searchIds.add(it.id.videoId);
      }
    }

    // Existing records (dedupe on video id across both tables)
    const { data: vids } = await db.from("youtube_videos").select("youtube_video_id");
    const { data: apps } = await db.from("media_appearances").select("external_url");
    const known = new Set((vids || []).map((v) => v.youtube_video_id));
    for (const a of apps || []) {
      const m = (a.external_url || "").match(/(?:v=|youtu\.be\/|shorts\/|live\/|embed\/)([\w-]{11})/);
      if (m) known.add(m[1]);
    }

    const newUploads = uploadIds.filter((id) => !known.has(id));
    const newSearch = [...searchIds].filter((id) => !known.has(id) && !uploadIds.includes(id));

    const details = async (ids: string[]) => {
      const out: any[] = [];
      for (let i = 0; i < ids.length; i += 50) {
        const d = await yt(`videos?id=${ids.slice(i, i + 50).join(",")}&part=snippet,contentDetails`, key);
        out.push(...(d.items || []));
      }
      return out;
    };

    let videosAdded = 0;
    const videoRows = (await details(newUploads)).map((v) => ({
      title: v.snippet.title,
      description: (v.snippet.description || "").slice(0, 500),
      youtube_url: `https://www.youtube.com/watch?v=${v.id}`,
      youtube_video_id: v.id,
      thumbnail_url: v.snippet.thumbnails?.maxres?.url || v.snippet.thumbnails?.high?.url || null,
      duration: parseDuration(v.contentDetails?.duration || ""),
      published_date: v.snippet.publishedAt?.split("T")[0] ?? null,
      channel_title: v.snippet.channelTitle,
      content_type: "original",
      review_status: "pending",
    }));
    if (videoRows.length) {
      const { error } = await db.from("youtube_videos").insert(videoRows);
      if (error) throw error;
      videosAdded = videoRows.length;
    }

    let appearancesAdded = 0;
    const appRows = (await details(newSearch))
      .filter((v) => MATCH.test(`${v.snippet.title} ${v.snippet.description}`))
      .map((v) => ({
        media_type: /podcast|episode|ep\.?\s?\d/i.test(v.snippet.title) ? "podcast" : "video",
        show_name: v.snippet.channelTitle,
        title: v.snippet.title,
        description: (v.snippet.description || "").slice(0, 600),
        thumbnail_url: v.snippet.thumbnails?.maxres?.url || v.snippet.thumbnails?.high?.url || null,
        external_url: `https://www.youtube.com/watch?v=${v.id}`,
        appearance_date: v.snippet.publishedAt?.split("T")[0] ?? null,
        review_status: "pending",
      }));
    if (appRows.length) {
      const { error } = await db.from("media_appearances").insert(appRows);
      if (error) throw error;
      appearancesAdded = appRows.length;
    }

    return json({
      success: true,
      channel_videos_found: uploadIds.length,
      videos_added: videosAdded,
      appearances_added: appearancesAdded,
      appearance_titles: appRows.map((r) => `${r.title} (${r.show_name})`),
    });
  } catch (e) {
    console.error("scan-youtube-channel", e);
    return json({ error: e instanceof Error ? e.message : "Scan failed" }, 500);
  }
});
