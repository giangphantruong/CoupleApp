"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Avatar from "@/components/ui/Avatar";

const LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/timeline", label: "Timeline" },
];

export default function NavBar({ profile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-10 w-full border-b border-primary-100/70 bg-primary-50/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/feed" className="font-display text-lg font-semibold text-primary-700">
          Us
        </Link>

        <nav className="flex items-center gap-1 rounded-full bg-white/70 p-1 shadow-soft">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-500 text-white"
                    : "text-ink-600 hover:text-primary-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Avatar name={profile?.display_name} className="h-8 w-8 text-sm" />
          <button
            onClick={handleSignOut}
            className="text-xs font-medium text-ink-400 transition-colors hover:text-primary-600"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
