"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/getCurrentProfile";
import { generatePairingCode } from "@/lib/pairingCode";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default function PairPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [myCode, setMyCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
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
    setJoining(true);

    const code = joinCode.trim().toUpperCase();
    const { data: found, error: lookupError } = await supabase
      .from("pairing_codes")
      .select("code, couple_id, created_by")
      .eq("code", code)
      .eq("used", false)
      .maybeSingle();

    if (lookupError || !found) {
      setError("That code doesn't look right, or it's already been used.");
      setJoining(false);
      return;
    }
    if (found.created_by === profile.id) {
      setError("That's your own code — get one from your partner instead.");
      setJoining(false);
      return;
    }

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ couple_id: found.couple_id })
      .eq("id", profile.id);
    if (updateProfileError) {
      setError(updateProfileError.message);
      setJoining(false);
      return;
    }

    await supabase.from("pairing_codes").update({ used: true }).eq("code", code);

    router.push("/feed");
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="animate-pulse text-ink-400">Setting things up…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <Card className="w-full max-w-xs p-6 text-center animate-fade-up">
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Link up with your partner
        </h1>
        <p className="mt-2 text-sm text-ink-500">Share this code with them:</p>
        <button
          onClick={handleCopy}
          className="mt-4 w-full rounded-xl border-2 border-dashed border-primary-500/40 bg-primary-500/10 py-5 font-display text-3xl font-semibold tracking-[0.3em] text-primary-300 transition-colors hover:bg-primary-500/15 active:scale-[0.98]"
        >
          {myCode}
        </button>
        <p className="mt-2 text-sm font-medium text-primary-400">
          {copied ? "Copied ✓" : "Tap to copy"}
        </p>
      </Card>

      <Card className="w-full max-w-xs p-6 text-center animate-fade-up">
        <p className="mb-3 text-sm text-ink-500">Got a code from them instead?</p>
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <Input
            type="text"
            placeholder="Enter their code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="text-center uppercase tracking-widest"
          />
          {error && <p className="text-sm text-primary-400">{error}</p>}
          <Button type="submit" disabled={joining || !joinCode} className="w-full">
            {joining ? "Linking…" : "Link accounts"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
