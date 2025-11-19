"use client";

import { useState, useRef, useEffect } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus(null);
      setUploadProgress(0);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  }

  function handleClear() {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setStatus(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setStatus("Requesting upload URL...");
    setUploadProgress(0);

    try {
      // Get pre-signed URL
      const res = await fetch("/api/videos/presign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "video/mp4",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get upload URL");
      }

      const { uploadUrl } = data;

      setStatus("Uploading to S3...");

      // Upload with progress tracking using XMLHttpRequest
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.send(file);
      });

      setStatus("Upload complete!");
      setUploadProgress(100);
      
      // Clear after successful upload
      setTimeout(() => {
        handleClear();
      }, 2000);
    } catch (err: any) {
      setStatus(`Error: ${err.message || "Upload failed"}`);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: 8, color: "#fff" }}>Upload Video</h1>
      <p style={{ marginBottom: 32, color: "#9ca3af" }}>
        Select a video file to preview and upload to your S3 bucket.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* File Input */}
        <div
          style={{
            border: "2px dashed #4b5563",
            borderRadius: 12,
            padding: 32,
            textAlign: "center",
            background: "#1f2937",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.background = "#1e3a8a";
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = "#4b5563";
            e.currentTarget.style.background = "#1f2937";
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "#4b5563";
            e.currentTarget.style.background = "#1f2937";
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile && droppedFile.type.startsWith("video/")) {
              setFile(droppedFile);
              setPreviewUrl(URL.createObjectURL(droppedFile));
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📹</div>
          <p style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: 8, color: "#e5e7eb" }}>
            Click to select or drag and drop
          </p>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
            Supports MP4, WebM, MOV and other video formats
          </p>
        </div>

        {/* Preview Section */}
        {previewUrl && file && (
          <div
            style={{
              border: "1px solid #4b5563",
              borderRadius: 12,
              padding: 16,
              background: "#1f2937",
            }}
          >
            <h2 style={{ marginBottom: 16, color: "#e5e7eb" }}>Preview</h2>
            <video
              src={previewUrl}
              controls
              style={{
                width: "100%",
                maxHeight: 500,
                borderRadius: 8,
                background: "#000",
              }}
            />
            <div style={{ marginTop: 12, fontSize: "0.9rem", color: "#9ca3af" }}>
              <p>
                <strong style={{ color: "#e5e7eb" }}>File:</strong> {file.name}
              </p>
              <p>
                <strong style={{ color: "#e5e7eb" }}>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <p>
                <strong style={{ color: "#e5e7eb" }}>Type:</strong> {file.type || "video/mp4"}
              </p>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div
            style={{
              border: "1px solid #4b5563",
              borderRadius: 12,
              padding: 24,
              background: "#1f2937",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              {/* Loading Spinner */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  border: "3px solid #374151",
                  borderTop: "3px solid #3b82f6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ margin: 0, fontWeight: "bold", color: "#e5e7eb" }}>{status}</p>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: "100%",
                height: 8,
                background: "#374151",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: "100%",
                  background: "#3b82f6",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <p style={{ marginTop: 8, textAlign: "center", fontWeight: "bold", color: "#3b82f6" }}>
              {uploadProgress}%
            </p>
          </div>
        )}

        {/* Status Message */}
        {status && !uploading && (
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: status.includes("Error")
                ? "#7f1d1d"
                : status.includes("complete")
                ? "#064e3b"
                : "#1f2937",
              border: `1px solid ${
                status.includes("Error")
                  ? "#991b1b"
                  : status.includes("complete")
                  ? "#065f46"
                  : "#4b5563"
              }`,
              color: status.includes("Error") ? "#fca5a5" : "#6ee7b7",
            }}
          >
            {status}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {file && !uploading && (
            <button
              onClick={handleClear}
              style={{
                padding: "12px 24px",
                fontSize: "1rem",
                fontWeight: "bold",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#4b5563";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#6b7280";
              }}
            >
              Clear
            </button>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              padding: "16px 48px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              background: !file || uploading ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: !file || uploading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: !file || uploading ? "none" : "0 4px 6px rgba(59, 130, 246, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (file && !uploading) {
                e.currentTarget.style.background = "#2563eb";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(59, 130, 246, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (file && !uploading) {
                e.currentTarget.style.background = "#3b82f6";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(59, 130, 246, 0.3)";
              }
            }}
          >
            {uploading ? "Uploading..." : "🚀 Upload Video"}
          </button>
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}


