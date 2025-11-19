"use client";

import { useRef, useState } from "react";
import ChatPanel from "@/components/ChatPanel";

export default function GoLivePage() {
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const [client, setClient] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startLive() {
    try {
      setError(null);
      setBusy(true);

      // Dynamically import the browser-only SDK
      const IVSBroadcastClient = (await import("amazon-ivs-web-broadcast")).default;

      // 1) Get ingest host + stream key from backend
      const resp = await fetch("/api/live/publish-config");
      const cfg = await resp.json();

      if (!resp.ok) throw new Error(cfg.error || "Failed to load IVS config");

      const ingestEndpointHost = cfg.ingestEndpointHost as string;
      const streamKey = cfg.streamKey as string;

      // 2) Create broadcast client with REQUIRED streamConfig
      const broadcastClient = IVSBroadcastClient.create({
        streamConfig: IVSBroadcastClient.BASIC_LANDSCAPE,
        ingestEndpoint: ingestEndpointHost, // HOST ONLY, no scheme/path
      });

      // 3) Attach preview canvas to the <video> element
      if (previewRef.current) {
        broadcastClient.attachPreview(previewRef.current);
      }

      // 4) Ask for camera + mic
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // 5) Add devices to the broadcast client
      broadcastClient.addVideoInputDevice(mediaStream, "camera1", { index: 0 });
      broadcastClient.addAudioInputDevice(mediaStream, "mic1");

      // 6) Start broadcast
      await broadcastClient.startBroadcast(streamKey);

      setClient(broadcastClient);
      setIsLive(true);
    } catch (e: any) {
      console.error("Failed to start live", e);
      setError(e?.message || "Failed to start live");
    } finally {
      setBusy(false);
    }
  }

  async function stopLive() {
    try {
      setError(null);
      if (client) {
        client.stopBroadcast();
        client.delete?.();
      }
      setClient(null);
      setIsLive(false);
    } catch (e: any) {
      console.error("Failed to stop live", e);
      setError(e?.message || "Failed to stop live");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: 10 }}>Go Live</h1>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Left side: Preview and controls */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ marginBottom: 16 }}>Preview</h2>
          {/* SDK draws into this canvas element */}
          <canvas
            ref={previewRef}
            style={{
              width: "100%",
              maxWidth: 800,
              height: 430,
              background: "#000",
              borderRadius: 12,
              border: "2px solid #ddd",
            }}
          />

          {/* Status and buttons below preview */}
          <div style={{ marginTop: 24, maxWidth: 800 }}>
            {/* Status indicator */}
            <div
              style={{
                padding: 16,
                background: isLive ? "rgba(59, 130, 246, 0.1)" : "rgba(0, 0, 0, 0.05)",
                borderRadius: 8,
                border: `2px solid ${isLive ? "#3b82f6" : "#e5e7eb"}`,
                marginBottom: 16,
                display: "inline-block",
              }}
            >
              <p style={{ fontSize: "1.1rem", fontWeight: "bold", margin: 0 }}>
                {isLive ? "🟢 LIVE" : "🔴 OFFLINE"}
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={startLive}
                disabled={isLive || busy}
                style={{
                  padding: "16px 32px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  background: isLive || busy ? "#9ca3af" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: isLive || busy ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  flex: "1 1 200px",
                }}
                onMouseEnter={(e) => {
                  if (!isLive && !busy) {
                    e.currentTarget.style.background = "#dc2626";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLive && !busy) {
                    e.currentTarget.style.background = "#ef4444";
                  }
                }}
              >
                {busy ? "Starting…" : "▶ Go Live"}
              </button>

              <button
                onClick={stopLive}
                disabled={!isLive}
                style={{
                  padding: "16px 32px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  background: !isLive ? "#9ca3af" : "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: !isLive ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  flex: "1 1 200px",
                }}
                onMouseEnter={(e) => {
                  if (isLive) {
                    e.currentTarget.style.background = "#4b5563";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isLive) {
                    e.currentTarget.style.background = "#6b7280";
                  }
                }}
              >
                Stop Live Stream
              </button>
            </div>

            {error && (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  color: "#dc2626",
                }}
              >
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Live Chat */}
        <div style={{ flex: "0 0 400px", minWidth: 300 }}>
          <h2 style={{ marginBottom: 16 }}>Live Chat</h2>
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}

