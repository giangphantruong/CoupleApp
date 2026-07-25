import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

function daysTogether(sinceIso) {
  const days = Math.floor((Date.now() - new Date(sinceIso).getTime()) / 86400000);
  if (days <= 0) return "Day one";
  if (days === 1) return "1 day together";
  return `${days} days together`;
}

export default function CoupleConnection({ people, since }) {
  const [a, b] = people;

  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-2xl bg-white/70 p-4 shadow-soft animate-fade-up">
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <Avatar
            name={a?.display_name}
            className="h-14 w-14 text-lg ring-4 ring-white shadow-pop"
          />
          <span className="max-w-16 truncate text-xs font-semibold text-ink-600">
            {a?.display_name}
          </span>
        </div>

        <div className="flex w-14 items-center">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-primary-300" />
          <span className="mx-1 text-lg text-primary-500">&#10084;</span>
          <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-primary-300" />
        </div>

        {b ? (
          <div className="flex flex-col items-center gap-1.5">
            <Avatar
              name={b.display_name}
              className="h-14 w-14 text-lg ring-4 ring-white shadow-pop"
            />
            <span className="max-w-16 truncate text-xs font-semibold text-ink-600">
              {b.display_name}
            </span>
          </div>
        ) : (
          <Link href="/pair" className="flex flex-col items-center gap-1.5">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-primary-300 text-xl text-primary-400 ring-4 ring-white">
              +
            </span>
            <span className="max-w-16 truncate text-xs font-semibold text-primary-500">
              Invite
            </span>
          </Link>
        )}
      </div>
      <p className="font-display text-sm italic text-ink-500">
        {b && since ? daysTogether(since) : "Waiting for your partner to join"}
      </p>
    </div>
  );
}
