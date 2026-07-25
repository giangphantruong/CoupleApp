"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/pair");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-2 text-center animate-fade-up">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-xs font-semibold tracking-[0.2em] text-primary-300 uppercase">
          Welcome back
        </span>
        <h1 className="font-display text-3xl font-semibold text-ink-900">
          Pick up right where you left off
        </h1>
        <p className="text-sm text-ink-500">
          New posts, new memories, new inside jokes are waiting on the other side.
        </p>
      </div>

      <Card className="w-full max-w-sm p-6 animate-fade-up">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-primary-400">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </Card>

      <p className="text-sm text-ink-500">
        No account yet?{" "}
        <Link href="/signup" className="font-semibold text-primary-400">
          Sign up
        </Link>
      </p>
    </main>
  );
}
