const PALETTE = [
  "bg-primary-500",
  "bg-accent-500",
  "bg-ink-600",
];

function colorFor(name) {
  const code = (name || "?").charCodeAt(0) || 0;
  return PALETTE[code % PALETTE.length];
}

export default function Avatar({ name, className = "" }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white ${colorFor(name)} ${className}`}
    >
      {initial}
    </span>
  );
}
