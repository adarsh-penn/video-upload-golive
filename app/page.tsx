"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Load images from imgs folder (in public directory)
    const imagePaths = [
      "/imgs/img1.jpg",
      "/imgs/img2.jpg",
      "/imgs/img3.jpg",
      "/imgs/img4.jpg",
      "/imgs/img5.jpg",
    ];
    setImages(imagePaths);
  }, []);

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#111827" }}>
      {/* Hero Section */}
      <div
        style={{
          padding: "80px 24px",
          textAlign: "center",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginBottom: 16,
            color: "#fff",
            lineHeight: 1.2,
          }}
        >
          Video Uploads & Live Streams
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "#9ca3af",
            maxWidth: 600,
            margin: "0 auto 48px",
          }}
        >
          Upload your videos, watch them anytime, start a live stream, and share the live broadcast with friends – all from one place.
        </p>
      </div>

      {/* Scrolling Images Section */}
      {images.length > 0 && (
        <div
          style={{
            overflow: "hidden",
            position: "relative",
            marginTop: 48,
            padding: "24px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 16,
              animation: "scroll 30s linear infinite",
              width: "fit-content",
            }}
          >
            {/* First set of images */}
            {images.map((img, idx) => (
              <div
                key={`first-${idx}`}
                style={{
                  flexShrink: 0,
                  width: 300,
                  height: 200,
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "2px solid #374151",
                }}
              >
                <Image
                  src={img}
                  alt={`Featured ${idx + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {images.map((img, idx) => (
              <div
                key={`second-${idx}`}
                style={{
                  flexShrink: 0,
                  width: 300,
                  height: 200,
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "2px solid #374151",
                }}
              >
                <Image
                  src={img}
                  alt={`Featured ${idx + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
