import { createClient } from "@supabase/supabase-js";

// These two values come from your Supabase project's Settings > API page.
// They're safe to expose to the browser (that's what NEXT_PUBLIC_ means) — access
// to actual data is controlled by the Row Level Security policies in supabase/schema.sql,
// not by keeping this URL/key secret.
// Fall back to harmless placeholders so the app can still build/boot without a
// .env.local — real signup/login just won't work until you add the real values.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
