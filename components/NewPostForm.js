"use client";

import { useEffect, useState } from "react";
import { uploadPost } from "@/lib/media";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LiveCamera from "@/components/LiveCamera";

export default function NewPostForm({ coupleId, userId, onPosted }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadPost({ coupleId, userId, file, caption });
      setFile(null);
      setCaption("");
      onPosted();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card as="form" onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4 p-4">
      {previewUrl ? (
        <div className="relative">
          {file?.type.startsWith("video") ? (
            <video
              src={previewUrl}
              controls
              className="h-64 w-64 rounded-full object-cover shadow-glow sm:h-72 sm:w-72"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Selected preview"
              className="h-64 w-64 rounded-full border-4 border-primary-500/40 object-cover shadow-glow sm:h-72 sm:w-72"
            />
          )}
          <button
            type="button"
            onClick={() => setFile(null)}
            className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-lg text-white backdrop-blur-sm"
            aria-label="Retake"
          >
            &#10005;
          </button>
        </div>
      ) : (
        <LiveCamera onCapture={setFile} />
      )}

      <label className="cursor-pointer text-xs font-medium text-ink-400 underline decoration-dotted hover:text-primary-400">
        or upload from your gallery
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </label>

      <Input
        type="text"
        placeholder="Say something about it (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full"
      />
      {error && <p className="text-sm text-primary-400">{error}</p>}
      <Button type="submit" disabled={!file || uploading} className="w-full">
        {uploading ? "Posting…" : "Post"}
      </Button>
    </Card>
  );
}
