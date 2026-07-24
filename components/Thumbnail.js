export default function Thumbnail({ post }) {
  if (post.media_type === "video") {
    return (
      <video
        src={post.url}
        crossOrigin="anonymous"
        muted
        className="h-16 w-16 rounded-md object-cover"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.url}
      crossOrigin="anonymous"
      alt={post.caption || "shared photo"}
      className="h-16 w-16 rounded-md object-cover"
    />
  );
}
