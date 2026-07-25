const ROTATIONS = [-3, 2, -1.5, 3, -2, 1.5];

export default function TimelinePhoto({ post, index = 0, align = "left" }) {
  const rotate = ROTATIONS[index % ROTATIONS.length];
  const time = new Date(post.taken_at).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="w-32 shrink-0 rounded-sm bg-white p-2 pb-3 shadow-pop transition-transform hover:z-10 hover:scale-105 hover:rotate-0 sm:w-36"
      style={{ transform: `rotate(${rotate}deg)`, transformOrigin: align === "left" ? "top left" : "top right" }}
    >
      {!post.url ? (
        <div className="flex aspect-square w-full items-center justify-center rounded-sm bg-stone-100 text-xs text-stone-400">
          &#9888;
        </div>
      ) : post.media_type === "video" ? (
        <video
          src={post.url}
          crossOrigin="anonymous"
          muted
          className="aspect-square w-full rounded-sm object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.url}
          crossOrigin="anonymous"
          alt={post.caption || "shared photo"}
          className="aspect-square w-full rounded-sm object-cover"
        />
      )}
      <p className="mt-1.5 truncate text-center font-display text-[11px] italic text-stone-600">
        {post.caption || time}
      </p>
    </div>
  );
}
