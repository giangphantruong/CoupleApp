"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
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
      <Card className="w-full max-w-xs p-6 animate-fade-up">
        <h1 className="mb-6 text-center font-display text-2xl font-semibold text-ink-900">
          Welcome back
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          />
          {error && <p className="text-sm text-primary-700">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </Card>
      <p className="text-sm text-ink-500">
        No account yet?{" "}
        <Link href="/signup" className="font-semibold text-primary-600">
          Sign up
        </Link>
      </p>
    </main>
  );
}
