import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <span className="rounded-full bg-primary-100 px-4 py-1 text-xs font-semibold tracking-wide text-primary-700 uppercase">
          Just the two of you
        </span>
        <h1 className="font-display text-5xl font-semibold text-ink-900">
          Us
        </h1>
        <p className="max-w-xs text-ink-500">
          A shared photo &amp; video timeline, made for two people telling one story.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3 animate-fade-up">
        <Link href="/signup" className="w-full">
          <Button className="w-full">Get started</Button>
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
