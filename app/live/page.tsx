"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import ChatPanel from "@/components/ChatPanel";

const playbackUrl = process.env.NEXT_PUBLIC_IVS_PLAYBACK_URL!;

export default function LivePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current || !playbackUrl) return;
    const video = videoRef.current;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playbackUrl;
      video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(playbackUrl);
      hls.attachMedia(video);
    }
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Live Stream</h1>
      <div style={{ display: "flex", gap: 16 }}>
        <video
          ref={videoRef}
          controls
          style={{ width: "70%", maxWidth: 900 }}
        />
        <div style={{ flex: 1 }}>
          <ChatPanel />
        </div>
      </div>
      <p style={{ marginTop: 12 }}>
        Share this page URL with your friend. They'll see the video and chat.
      </p>
    </div>
  );
}


