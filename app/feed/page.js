"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/getCurrentProfile";
import { getSignedUrl } from "@/lib/media";
import NewPostForm from "@/components/NewPostForm";
import PostCard from "@/components/PostCard";

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
    <main className="flex flex-1 flex-col items-center gap-4 bg-pink-50 px-4 py-6">
      <div className="flex w-full max-w-md items-center justify-between">
        <h1 className="text-xl font-bold text-pink-600">Your feed</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/timeline" className="font-medium text-pink-600">
            Timeline
          </Link>
          <button onClick={handleSignOut} className="text-gray-500">
            Sign out
          </button>
        </div>
      </div>

      <div className="w-full max-w-md">
        <NewPostForm
          coupleId={profile.couple_id}
          userId={profile.id}
          onPosted={() => loadPosts(profile.couple_id)}
        />
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        {loadingPosts && <p className="text-center text-gray-500">Loading…</p>}
        {!loadingPosts && posts.length === 0 && (
          <p className="text-center text-gray-500">
            Nothing posted yet — take the first photo together!
          </p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
