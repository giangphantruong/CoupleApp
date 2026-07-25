import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-5 animate-fade-up">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-xs font-semibold tracking-[0.2em] text-primary-300 uppercase">
          Just the two of you
        </span>
        <h1 className="bg-gradient-to-br from-primary-300 via-primary-400 to-accent-400 bg-clip-text font-display text-7xl font-black text-transparent italic sm:text-8xl">
          Us.
        </h1>
        <p className="max-w-xs text-lg text-ink-500">
          Every sunrise, every 2am snack run, every stupid selfie —
          one shared story, nobody else invited.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3 animate-fade-up">
        <Link href="/signup" className="w-full">
          <Button className="w-full">Start our story</Button>
        </Link>
        <Link href="/login" className="w-full">
          <Button variant="secondary" className="w-full">
            Log in
          </Button>
        </Link>
      </div>
    </main>
  );
}
