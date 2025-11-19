"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type VideoItem = {
  key: string;
  lastModified?: string;
  size?: number;
  playbackUrl: string;
};

function WatchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const key = searchParams.get("key");

  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // Load list of all videos
  useEffect(() => {
    async function loadList() {
      const res = await fetch("/api/videos/list");
      const data = await res.json();
      if (res.ok) setVideos(data.items || []);
    }
    loadList();
  }, []);

  // Load playback URL for the selected video
  useEffect(() => {
    if (!key) return;
    async function loadPlayback() {
      const res = await fetch(`/api/videos/play?key=${encodeURIComponent(key!)}`);
      const data = await res.json();
      if (res.ok) setPlaybackUrl(data.playbackUrl);
    }
    loadPlayback();
  }, [key]);

  // If no key in URL, redirect back to /videos
  useEffect(() => {
    if (!key) router.push("/videos");
  }, [key, router]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Watch Video</h1>

      {/* Main player */}
      <div style={{ marginTop: 16, marginBottom: 32 }}>
        {playbackUrl ? (
          <video
            src={playbackUrl}
            controls
            style={{ width: "100%", maxWidth: 800 }}
          />
        ) : (
          <p>Loading video...</p>
        )}
      </div>

      {/* Other videos below, like YouTube suggestions */}
      <h2>More Videos</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 12,
        }}
      >
        {videos
          .filter((v) => v.key !== key) // hide current video from list
          .map((v) => (
            <div
              key={v.key}
              style={{
                border: "1px solid #444",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
              }}
              onClick={() =>
                router.push(`/watch?key=${encodeURIComponent(v.key)}`)
              }
            >
              {/* simple thumbnail – can be upgraded later */}
              <video
                src={v.playbackUrl}
                muted
                playsInline
                preload="metadata"
                style={{ width: "100%", borderRadius: 4 }}
              />
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  wordBreak: "break-all",
                }}
              >
                {v.key}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <WatchPageContent />
    </Suspense>
  );
}

