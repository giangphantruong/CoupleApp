"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/getCurrentProfile";
import { generatePairingCode } from "@/lib/pairingCode";

export const dynamic = "force-dynamic";

export default function PairPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [myCode, setMyCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) {
        router.push("/login");
        return;
      }

      // Already linked to a partner? No need to be on this screen.
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("couple_id", currentProfile.couple_id);
      if (count >= 2) {
        router.push("/feed");
        return;
      }

      if (cancelled) return;
      setProfile(currentProfile);

      // Reuse an existing unused code if we already made one, otherwise mint a new one.
      const { data: existingCode } = await supabase
        .from("pairing_codes")
        .select("code")
        .eq("created_by", currentProfile.id)
        .eq("used", false)
        .maybeSingle();

      if (existingCode) {
        if (!cancelled) setMyCode(existingCode.code);
      } else {
        for (let attempt = 0; attempt < 3; attempt++) {
          const candidate = generatePairingCode();
          const { error: insertError } = await supabase
            .from("pairing_codes")
            .insert({
              code: candidate,
              couple_id: currentProfile.couple_id,
              created_by: currentProfile.id,
            });
          if (!insertError) {
            if (!cancelled) setMyCode(candidate);
            break;
          }
        }
      }

      if (!cancelled) setLoading(false);
    }

    setup();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleCopy() {
    await navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError("");

    const code = joinCode.trim().toUpperCase();
    const { data: found, error: lookupError } = await supabase
      .from("pairing_codes")
      .select("code, couple_id, created_by")
      .eq("code", code)
      .eq("used", false)
      .maybeSingle();

    if (lookupError || !found) {
      setError("That code doesn't look right, or it's already been used.");
      return;
    }
    if (found.created_by === profile.id) {
      setError("That's your own code — get one from your partner instead.");
      return;
    }

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ couple_id: found.couple_id })
      .eq("id", profile.id);
    if (updateProfileError) {
      setError(updateProfileError.message);
      return;
    }

    await supabase.from("pairing_codes").update({ used: true }).eq("code", code);

    router.push("/feed");
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-pink-50">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-pink-50 px-6 py-12">
      <div className="flex w-full max-w-xs flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-bold text-pink-600">Link up with your partner</h1>
        <p className="text-gray-600">Share this code with them:</p>
        <button
          onClick={handleCopy}
          className="w-full rounded-lg border-2 border-dashed border-pink-400 bg-white py-4 text-3xl font-bold tracking-[0.3em] text-pink-600"
        >
          {myCode}
        </button>
        <p className="text-sm text-gray-500">{copied ? "Copied!" : "Tap to copy"}</p>
      </div>

      <div className="w-full max-w-xs border-t border-pink-200 pt-8 text-center">
        <p className="mb-3 text-gray-600">Got a code from them instead?</p>
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter their code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="rounded-lg border border-pink-200 px-4 py-3 text-center uppercase tracking-widest"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="rounded-lg bg-pink-500 px-6 py-3 font-medium text-white"
          >
            Link accounts
          </button>
        </form>
      </div>
    </main>
  );
}
