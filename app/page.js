import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-pink-50 px-6 text-center">
      <h1 className="text-4xl font-bold text-pink-600">Us</h1>
      <p className="max-w-sm text-gray-600">
        A shared photo &amp; video timeline, just for the two of you.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-pink-500 px-6 py-3 text-center font-medium text-white"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-pink-300 px-6 py-3 text-center font-medium text-pink-600"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
