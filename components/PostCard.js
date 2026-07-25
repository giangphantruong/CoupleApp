"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";

export default function PostCard({ post }) {
  const [loaded, setLoaded] = useState(false);
  const time = new Date(post.taken_at).toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white shadow-soft">
      <div className="relative">
        {!loaded && post.url && (
          <div className="absolute inset-0 animate-shimmer" />
        )}
        {!post.url && (
          <div className="flex h-48 w-full items-center justify-center bg-ink-50 text-sm text-ink-400">
            Couldn&apos;t load this media
          </div>
        )}
        {post.url && post.media_type === "video" ? (
          <video
            src={post.url}
            controls
            onLoadedData={() => setLoaded(true)}
            className="max-h-96 w-full bg-black object-contain"
          />
        ) : post.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.url}
            alt={post.caption || "shared photo"}
            onLoad={() => setLoaded(true)}
            className="max-h-96 w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex items-center gap-3 p-3">
        <Avatar name={post.profiles?.display_name} className="h-8 w-8 text-sm" />
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-ink-800">
            {post.profiles?.display_name} <span className="font-normal text-ink-400">· {time}</span>
          </p>
          {post.caption && <p className="text-sm text-ink-600">{post.caption}</p>}
        </div>
      </div>
    </div>
  );
}
