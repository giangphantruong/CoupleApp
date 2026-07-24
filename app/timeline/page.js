"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toPng } from "html-to-image";
import { supabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/getCurrentProfile";
import { getSignedUrl } from "@/lib/media";
import { groupPostsByHour, formatHourLabel, todayAsDateInputValue } from "@/lib/timeline";
import Thumbnail from "@/components/Thumbnail";

export const dynamic = "force-dynamic";

export default function TimelinePage() {
  const router = useRouter();
  const tableRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [people, setPeople] = useState([]); // the couple's two profiles, in a stable order
  const [date, setDate] = useState(todayAsDateInputValue());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadDay = useCallback(async (coupleId, day) => {
    setLoading(true);
    const start = new Date(`${day}T00:00:00`);
    const end = new Date(`${day}T23:59:59.999`);

    const { data } = await supabase
      .from("posts")
      .select("id, media_path, media_type, caption, taken_at, user_id")
      .eq("couple_id", coupleId)
      .gte("taken_at", start.toISOString())
      .lte("taken_at", end.toISOString())
      .order("taken_at", { ascending: true });

    const withUrls = await Promise.all(
      (data || []).map(async (post) => ({ ...post, url: await getSignedUrl(post.media_path) }))
    );
    setPosts(withUrls);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) {
        router.push("/login");
        return;
      }
      setProfile(currentProfile);

      const { data: couplePeople } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("couple_id", currentProfile.couple_id)
        .order("id", { ascending: true });
      setPeople(couplePeople || []);

      loadDay(currentProfile.couple_id, date);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function handleDateChange(newDate) {
    setDate(newDate);
    if (profile) loadDay(profile.couple_id, newDate);
  }

  async function handleExport() {
    if (!tableRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(tableRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `timeline-${date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("Couldn't export the image: " + err.message);
    } finally {
      setExporting(false);
    }
  }

  const rows = groupPostsByHour(posts);

  return (
    <main className="flex flex-1 flex-col items-center gap-4 bg-pink-50 px-4 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <Link href="/feed" className="text-sm font-medium text-pink-600">
          ← Feed
        </Link>
        <h1 className="text-xl font-bold text-pink-600">Timeline</h1>
        <button
          onClick={handleExport}
          disabled={exporting || rows.length === 0}
          className="rounded-lg bg-pink-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {exporting ? "Exporting…" : "Export PNG"}
        </button>
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => handleDateChange(e.target.value)}
        className="rounded-lg border border-pink-200 px-3 py-2"
      />

      {people.length < 2 && (
        <p className="max-w-md text-center text-sm text-gray-500">
          Once your partner links their account, their photos will show up
          side by side with yours here.
        </p>
      )}

      <div ref={tableRef} className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-sm">
        <div
          className="grid border-b border-gray-100 bg-pink-50 text-sm font-semibold text-pink-700"
          style={{ gridTemplateColumns: `80px repeat(${Math.max(people.length, 1)}, 1fr)` }}
        >
          <div className="p-2">Time</div>
          {people.map((person) => (
            <div key={person.id} className="p-2">
              {person.display_name}
            </div>
          ))}
          {people.length === 0 && <div className="p-2">You</div>}
        </div>

        {loading && <p className="p-4 text-center text-gray-500">Loading…</p>}
        {!loading && rows.length === 0 && (
          <p className="p-4 text-center text-gray-500">No posts on this day yet.</p>
        )}
        {!loading &&
          rows.map(([hour, hourPosts]) => (
            <div
              key={hour}
              className="grid border-b border-gray-50 last:border-0"
              style={{ gridTemplateColumns: `80px repeat(${Math.max(people.length, 1)}, 1fr)` }}
            >
              <div className="p-2 text-sm text-gray-500">{formatHourLabel(hour)}</div>
              {(people.length > 0 ? people : [profile]).map((person) => (
                <div key={person.id} className="flex flex-wrap gap-1 p-2">
                  {hourPosts
                    .filter((post) => post.user_id === person.id)
                    .map((post) => (
                      <Thumbnail key={post.id} post={post} />
                    ))}
                </div>
              ))}
            </div>
          ))}
      </div>
    </main>
  );
}
