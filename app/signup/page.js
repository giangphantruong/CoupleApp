"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
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
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <Card className="w-full max-w-xs p-6 animate-fade-up">
        <h1 className="mb-6 text-center font-display text-2xl font-semibold text-ink-900">
          Create your account
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-sm text-primary-700">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>
      </Card>
      <p className="text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-600">
          Log in
        </Link>
      </p>
    </main>
  );
}
