const variants = {
  primary:
    "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow hover:brightness-110 active:scale-[0.98] disabled:hover:brightness-100",
  secondary:
    "border border-white/15 bg-white/[0.04] text-ink-900 hover:bg-white/[0.08] active:scale-[0.98]",
  ghost: "text-ink-500 hover:bg-white/[0.06] hover:text-ink-700",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
