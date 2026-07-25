export default function Card({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag
      className={`rounded-2xl border border-white/10 bg-white/[0.04] shadow-soft backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
