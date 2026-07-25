"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/getCurrentProfile";
import { getSignedUrl } from "@/lib/media";
import NewPostForm from "@/components/NewPostForm";
import PostCard from "@/components/PostCard";
import NavBar from "@/components/NavBar";

// This page depends on the logged-in user's session, so it can't be pre-built
// as static HTML — it has to run fresh each time someone visits it.
export const dynamic = "force-dynamic";

export default function FeedPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const loadPosts = useCallback(async (coupleId) => {
    setLoadingPosts(true);
    const { data } = await supabase
      .from("posts")
      .select("id, media_path, media_type, caption, taken_at, user_id, profiles(display_name)")
      .eq("couple_id", coupleId)
      .order("taken_at", { ascending: false });

    const withUrls = await Promise.all(
      (data || []).map(async (post) => ({ ...post, url: await getSignedUrl(post.media_path) }))
    );
    setPosts(withUrls);
    setLoadingPosts(false);
  }, []);

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) {
        router.push("/login");
        return;
      }
      setProfile(currentProfile);
      loadPosts(currentProfile.couple_id);
    }
    load();
  }, [router, loadPosts]);

  if (!profile) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="animate-pulse text-ink-400">Loading…</p>
      </main>
    );
  }

  return (
    <>
      <NavBar profile={profile} />
      <main className="flex flex-1 flex-col items-center gap-4 px-4 py-6">
        <div className="w-full max-w-md animate-fade-up">
          <NewPostForm
            coupleId={profile.couple_id}
            userId={profile.id}
            onPosted={() => loadPosts(profile.couple_id)}
          />
        </div>

        <div className="flex w-full max-w-md flex-col gap-4">
          {loadingPosts &&
            [0, 1].map((i) => (
              <div key={i} className="h-72 w-full animate-shimmer rounded-2xl" />
            ))}
          {!loadingPosts && posts.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 py-14 text-center shadow-soft">
              <span className="text-3xl">🤍</span>
              <p className="text-ink-500">
                Nothing posted yet — take the first photo together!
              </p>
            </div>
          )}
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
