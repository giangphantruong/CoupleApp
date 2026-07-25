"use client";

import { useEffect, useState } from "react";
import { uploadPost } from "@/lib/media";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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
      e.target.reset();
      onPosted();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card
      as="form"
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 p-4"
    >
      <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/60 px-4 py-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50">
        {previewUrl ? (
          file?.type.startsWith("video") ? (
            <video src={previewUrl} className="max-h-48 rounded-lg" muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Selected preview" className="max-h-48 rounded-lg object-contain" />
          )
        ) : (
          <>
            <span className="text-2xl">📸</span>
            <span className="text-sm font-medium text-primary-600">
              Tap to add a photo or video
            </span>
          </>
        )}
        {previewUrl && (
          <span className="text-xs font-medium text-primary-500 group-hover:underline">
            Tap to change
          </span>
        )}
        <input
          type="file"
          accept="image/*,video/*"
          capture="environment"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </label>
      <Input
        type="text"
        placeholder="Say something about it (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      {error && <p className="text-sm text-primary-700">{error}</p>}
      <Button type="submit" disabled={!file || uploading} className="w-full">
        {uploading ? "Posting…" : "Post"}
      </Button>
    </Card>
  );
}
