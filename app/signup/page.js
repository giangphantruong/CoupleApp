"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Step 1: create the login (email + password) with Supabase Auth.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      // Supabase's default settings require confirming your email before you're
      // fully signed in — if that's on, there's no session yet to finish setup with.
      setError(
        "Check your email to confirm your account, then come back and log in."
      );
      setLoading(false);
      return;
    }

    // Step 2: every new person starts their own "couple" (solo, waiting for a partner).
    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .insert({})
      .select()
      .single();
    if (coupleError) {
      setError(coupleError.message);
      setLoading(false);
      return;
    }

    // Step 3: create their profile row, already linked to that couple.
    // Routed through an RPC (rather than a direct insert) because this project's
    // RLS enforcement for plain inserts on profiles has proven unreliable — see
    // create_my_profile() in supabase/schema.sql.
    const { error: profileError } = await supabase.rpc("create_my_profile", {
      p_display_name: displayName,
      p_couple_id: couple.id,
    });
    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/pair");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-2 text-center animate-fade-up">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-xs font-semibold tracking-[0.2em] text-primary-300 uppercase">
          Start your story
        </span>
        <h1 className="font-display text-3xl font-semibold text-ink-900">
          One account. Two people. Zero audience.
        </h1>
        <p className="text-sm text-ink-500">
          Set up your side in a few seconds — you&apos;ll link up with your partner right after.
        </p>
      </div>

      <Card className="w-full max-w-sm p-6 animate-fade-up">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Your name"
            type="text"
            placeholder="What should we call you?"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-sm text-primary-400">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>
      </Card>
      <p className="text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-400">
          Log in
        </Link>
      </p>
    </main>
  );
}
