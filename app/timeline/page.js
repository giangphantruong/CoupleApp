"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { supabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/getCurrentProfile";
import { getSignedUrl } from "@/lib/media";
import { groupPostsByHour, formatHourLabel, todayAsDateInputValue } from "@/lib/timeline";
import Thumbnail from "@/components/Thumbnail";
import NavBar from "@/components/NavBar";
import Button from "@/components/ui/Button";

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
  const columns = Math.max(people.length, 1);

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
        <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 animate-fade-up">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Timeline</h1>
            <p className="text-sm text-ink-500">Your day, side by side.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-700 shadow-soft focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
            />
            <Button
              onClick={handleExport}
              disabled={exporting || rows.length === 0}
              className="px-4 py-2 text-sm"
            >
              {exporting ? "Exporting…" : "Export PNG"}
            </Button>
          </div>
        </div>

        {people.length < 2 && (
          <p className="max-w-md text-center text-sm text-ink-500 animate-fade-up">
            Once your partner links their account, their photos will show up
            side by side with yours here.
          </p>
        )}

        <div
          ref={tableRef}
          className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-pop animate-fade-up"
        >
          <div
            className="grid border-b border-primary-100 bg-primary-50 text-sm font-semibold text-primary-700"
            style={{ gridTemplateColumns: `72px repeat(${columns}, 1fr)` }}
          >
            <div className="p-3">Time</div>
            {people.map((person) => (
              <div key={person.id} className="p-3">
                {person.display_name}
              </div>
            ))}
            {people.length === 0 && <div className="p-3">You</div>}
          </div>

          {loading && (
            <div className="flex flex-col gap-2 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 w-full animate-shimmer rounded-lg" />
              ))}
            </div>
          )}
          {!loading && rows.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <span className="text-3xl">📭</span>
              <p className="text-ink-500">No posts on this day yet.</p>
            </div>
          )}
          {!loading &&
            rows.map(([hour, hourPosts]) => (
              <div
                key={hour}
                className="grid border-b border-ink-50 last:border-0 hover:bg-primary-50/40"
                style={{ gridTemplateColumns: `72px repeat(${columns}, 1fr)` }}
              >
                <div className="p-3 text-sm font-medium text-ink-400">
                  {formatHourLabel(hour)}
                </div>
                {(people.length > 0 ? people : [profile]).map((person) => (
                  <div key={person.id} className="flex flex-wrap gap-1.5 p-2.5">
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
    </>
  );
}
