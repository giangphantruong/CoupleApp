"use client";

import { useEffect, useRef, useState } from "react";

export default function LiveCamera({ onCapture }) {
  const videoRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream;
    let cancelled = false;
    setReady(false);
    setError("");

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) setError("Couldn't access your camera — use the gallery option below instead.");
      }
    }

    start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode]);

  function handleCapture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      },
      "image/jpeg",
      0.92
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-primary-500/40 bg-black shadow-glow sm:h-72 sm:w-72">
        {error ? (
          <p className="px-6 text-center text-sm text-ink-400">{error}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full rounded-full object-cover"
            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
          />
        )}
        {!error && (
          <button
            type="button"
            onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
            className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-lg text-white backdrop-blur-sm"
            aria-label="Flip camera"
          >
            &#8635;
          </button>
        )}
      </div>

      {!error && (
        <button
          type="button"
          onClick={handleCapture}
          disabled={!ready}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-accent-500 shadow-glow transition-transform active:scale-90 disabled:opacity-40"
          aria-label="Take photo"
        >
          <span className="h-12 w-12 rounded-full border-2 border-white" />
        </button>
      )}
    </div>
  );
}
