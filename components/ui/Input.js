export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-ink-900 placeholder:text-ink-400 transition-colors focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/20 ${className}`}
      {...props}
    />
  );
}
