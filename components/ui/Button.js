const variants = {
  primary:
    "bg-primary-500 text-white shadow-soft hover:bg-primary-600 active:scale-[0.98] disabled:hover:bg-primary-500",
  secondary:
    "border border-primary-200 bg-white text-primary-700 hover:bg-primary-50 active:scale-[0.98]",
  ghost: "text-ink-500 hover:bg-ink-50 hover:text-ink-700",
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
