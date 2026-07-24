"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      display_name: displayName,
      couple_id: couple.id,
    });
    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/pair");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-pink-50 px-6">
      <h1 className="text-2xl font-bold text-pink-600">Create your account</h1>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        <input
          type="text"
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="rounded-lg border border-pink-200 px-4 py-3"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg border border-pink-200 px-4 py-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-lg border border-pink-200 px-4 py-3"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-pink-500 px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-pink-600">
          Log in
        </Link>
      </p>
    </main>
  );
}
