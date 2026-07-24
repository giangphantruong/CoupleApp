export default function PostCard({ post }) {
  const time = new Date(post.taken_at).toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-sm">
      {post.media_type === "video" ? (
        <video src={post.url} controls className="max-h-96 w-full bg-black object-contain" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.url} alt={post.caption || "shared photo"} className="max-h-96 w-full object-cover" />
      )}
      <div className="flex flex-col gap-1 p-3">
        <p className="text-sm font-medium text-pink-600">
          {post.profiles?.display_name} · {time}
        </p>
        {post.caption && <p className="text-sm text-gray-700">{post.caption}</p>}
      </div>
    </div>
  );
}
