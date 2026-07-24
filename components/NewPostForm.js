"use client";

import { useState } from "react";
import { uploadPost } from "@/lib/media";

export default function NewPostForm({ coupleId, userId, onPosted }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadPost({ coupleId, userId, file, caption });
      setFile(null);
      setCaption("");
      e.target.reset();
      onPosted();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-xl bg-white p-4 shadow-sm"
    >
      <input
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />
      <input
        type="text"
        placeholder="Say something about it (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="rounded-lg border border-pink-200 px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!file || uploading}
        className="rounded-lg bg-pink-500 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {uploading ? "Posting…" : "Post"}
      </button>
    </form>
  );
}
