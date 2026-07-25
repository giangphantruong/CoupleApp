"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { supabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/getCurrentProfile";
import { getSignedUrl } from "@/lib/media";
import { groupPostsByHour, formatHourLabel, todayAsDateInputValue } from "@/lib/timeline";
import TimelinePhoto from "@/components/TimelinePhoto";
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
  const [personA, personB] = people;
  const solo = people.length < 2;

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
            <h1 className="font-display text-2xl font-semibold text-ink-900">Your story</h1>
            <p className="text-sm text-ink-500">A little scrapbook of the day.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-ink-700 shadow-soft focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
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

        {solo && (
          <p className="max-w-md text-center text-sm text-ink-500 animate-fade-up">
            Once your partner links their account, their photos will show up
            woven in alongside yours here.
          </p>
        )}

        <div
          ref={tableRef}
          className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-pop animate-fade-up sm:p-8"
        >
          {!solo && (
            <div className="mb-6 flex items-center justify-between text-sm font-semibold text-primary-700">
              <span>{personA?.display_name}</span>
              <span>{personB?.display_name}</span>
            </div>
          )}

          {loading && (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 w-full animate-shimmer rounded-lg" />
              ))}
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <span className="text-3xl">📭</span>
              <p className="text-stone-500">No posts on this day yet.</p>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <div className="relative">
              <div className="absolute top-1 bottom-1 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-primary-200 via-primary-300 to-primary-200" />
              <div className="flex flex-col gap-8">
                {rows.map(([hour, hourPosts]) => {
                  const leftPosts = solo
                    ? hourPosts
                    : hourPosts.filter((p) => p.user_id === personA?.id);
                  const rightPosts = solo
                    ? []
                    : hourPosts.filter((p) => p.user_id === personB?.id);

                  return (
                    <div key={hour} className="relative grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                      <div className="flex flex-wrap justify-end gap-3 pt-6">
                        {leftPosts.map((post, i) => (
                          <TimelinePhoto key={post.id} post={post} index={i} align="left" />
                        ))}
                      </div>

                      <div className="z-10 flex flex-col items-center pt-0.5">
                        <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-soft">
                          {formatHourLabel(hour)}
                        </span>
                      </div>

                      <div className="flex flex-wrap justify-start gap-3 pt-6">
                        {rightPosts.map((post, i) => (
                          <TimelinePhoto key={post.id} post={post} index={i} align="right" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
