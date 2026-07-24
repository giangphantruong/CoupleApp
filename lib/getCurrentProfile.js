import { supabase } from "./supabase";

// Fetches "who is logged in, and are they paired yet" — several pages need this
// exact check (are they logged in? do they have a couple_id?), so it lives in one place.
export async function getCurrentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, couple_id")
    .eq("id", user.id)
    .single();

  return profile;
}
