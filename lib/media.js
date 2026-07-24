import { supabase } from "./supabase";

// Uploads a file into Storage under "<couple_id>/<random-name>", then records
// it as a row in `posts` so it shows up in the feed/timeline.
export async function uploadPost({ coupleId, userId, file, caption, takenAt }) {
  const isVideo = file.type.startsWith("video/");
  const ext = file.name.includes(".") ? file.name.split(".").pop() : isVideo ? "mp4" : "jpg";
  const path = `${coupleId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("posts").insert({
    couple_id: coupleId,
    user_id: userId,
    media_path: path,
    media_type: isVideo ? "video" : "photo",
    caption: caption || null,
    taken_at: takenAt || new Date().toISOString(),
  });
  if (insertError) throw insertError;
}

// Storage bucket is private, so viewing a file requires a temporary signed link
// rather than a plain public URL (that's what keeps other couples locked out).
export async function getSignedUrl(path) {
  const { data, error } = await supabase.storage.from("media").createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
