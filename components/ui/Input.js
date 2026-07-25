export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 transition-colors focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100 ${className}`}
      {...props}
    />
  );
}
