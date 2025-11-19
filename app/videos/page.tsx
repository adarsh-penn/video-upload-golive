"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type VideoItem = {
  key: string;
  lastModified?: string;
  size?: number;
  playbackUrl: string;
};

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/videos/list");
      const data = await res.json();
      if (res.ok) setVideos(data.items || []);
    }
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>My Uploaded Videos</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {videos.map((v) => (
          <Link
            key={v.key}
            href={`/watch?key=${encodeURIComponent(v.key)}`}
            style={{
              border: "1px solid #444",
              borderRadius: 8,
              padding: 8,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {/* small auto-thumbnail using video */}
            <video
              src={v.playbackUrl}
              muted
              playsInline
              preload="metadata"
              style={{ width: "100%", borderRadius: 4 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, wordBreak: "break-all" }}>
              {v.key}
            </div>
            <div style={{ marginTop: 4, fontSize: 13 }}>Play</div>
          </Link>
        ))}
      </div>
    </div>
  );
}


