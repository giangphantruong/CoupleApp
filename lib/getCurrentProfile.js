import { supabase } from "./supabase";

// Fetches "who is logged in, and are they paired yet" — several pages need this
// exact check (are they logged in? do they have a couple_id?), so it lives in one place.
export async function getCurrentProfile() {
  // getSession() reads the persisted session from local storage (and refreshes it if
  // expired) without a network round trip first — getUser() always calls out to the
  // Auth server, which is slow/fragile right as a PWA cold-starts and can make you
  // look logged out when you're not.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, couple_id")
    .eq("id", user.id)
    .single();

  return profile;
}
