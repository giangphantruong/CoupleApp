"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/getCurrentProfile";

// This page depends on the logged-in user's session, so it can't be pre-built
// as static HTML — it has to run fresh each time someone visits it.
export const dynamic = "force-dynamic";

export default function FeedPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) {
        router.push("/login");
        return;
      }
      setProfile(currentProfile);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!profile) {
    return (
      <main className="flex flex-1 items-center justify-center bg-pink-50">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-pink-50 px-6 text-center">
      <h1 className="text-2xl font-bold text-pink-600">You&apos;re linked up, {profile.display_name}! 🎉</h1>
      <p className="max-w-sm text-gray-600">
        The shared feed and timeline come next — this is just confirming
        signup and pairing works end to end.
      </p>
      <button
        onClick={handleSignOut}
        className="rounded-lg border border-pink-300 px-6 py-3 font-medium text-pink-600"
      >
        Sign out
      </button>
    </main>
  );
}
