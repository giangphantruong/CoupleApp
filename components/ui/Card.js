export default function Card({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag
      className={`rounded-2xl bg-white/90 shadow-soft backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
