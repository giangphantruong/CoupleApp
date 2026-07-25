export default function Thumbnail({ post }) {
  if (!post.url) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-md bg-ink-50 text-xs text-ink-400">
        ⚠
      </div>
    );
  }

  if (post.media_type === "video") {
    return (
      <video
        src={post.url}
        crossOrigin="anonymous"
        muted
        className="h-16 w-16 rounded-md object-cover shadow-soft transition-transform hover:scale-105"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.url}
      crossOrigin="anonymous"
      alt={post.caption || "shared photo"}
      className="h-16 w-16 rounded-md object-cover shadow-soft transition-transform hover:scale-105"
    />
  );
}
