"use client";

import { useState, useRef, useCallback } from "react";
import { getBunnyThumbnailUrl } from "@/lib/bunny";

interface VideoUploaderProps {
  lectureId: string;
  courseId: string;
  lectureTitle: string;
  existingVideoId?: string | null;
  onUploadComplete?: (videoId: string, duration: number) => void;
}

type UploadState =
  | "idle"
  | "creating"
  | "uploading"
  | "processing"
  | "ready"
  | "error";

const STATUS_LABELS: Record<number, string> = {
  0: "Queued",
  1: "Processing",
  2: "Encoding",
  3: "Ready",
  4: "Error",
  5: "Uploaded",
};

export default function VideoUploader({
  lectureId,
  courseId,
  lectureTitle,
  existingVideoId,
  onUploadComplete,
}: VideoUploaderProps) {
  const [state, setState] = useState<UploadState>(
    existingVideoId ? "ready" : "idle"
  );
  const [videoId, setVideoId] = useState<string | null>(existingVideoId ?? null);
  const [progress, setProgress] = useState(0);
  const [encodeProgress, setEncodeProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Poll encoding status ──────────────────────────────────────────────────
  function startPolling(vid: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/video/status?videoId=${vid}&lectureId=${lectureId}`
        );
        const data = await res.json();

        setEncodeProgress(data.encodeProgress ?? 0);

        if (data.ready) {
          clearInterval(pollRef.current!);
          setState("ready");
          if (onUploadComplete) onUploadComplete(vid, data.duration ?? 0);
        } else if (data.status === 4) {
          clearInterval(pollRef.current!);
          setState("error");
          setError("Video encoding failed. Please try again.");
        }
      } catch {
        // keep polling
      }
    }, 3000);
  }

  // ── Upload via TUS ────────────────────────────────────────────────────────
  async function uploadFile(file: File) {
    setError(null);
    setState("creating");
    setProgress(0);

    // Validate
    const maxSize = 10 * 1024 * 1024 * 1024; // 10 GB
    if (file.size > maxSize) {
      setError("File is too large. Maximum size is 10 GB.");
      setState("idle");
      return;
    }

    const allowed = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported format. Use MP4, WebM, MOV, or AVI.");
      setState("idle");
      return;
    }

    try {
      // Step 1: Create video entry in Bunny
      const createRes = await fetch("/api/video/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lectureTitle,
          lectureId,
          courseId,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || "Failed to create video");
      }

      const { videoId: vid, libraryId, apiKey } = await createRes.json();
      setVideoId(vid);
      setState("uploading");

      // Step 2: TUS upload
      const { default: tus } = await import("tus-js-client");

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: "https://video.bunnycdn.com/tusupload",
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            AuthorizationSignature: apiKey,
            AuthorizationExpire: "0",
            VideoId: vid,
            LibraryId: libraryId,
          },
          metadata: {
            filetype: file.type,
            title: lectureTitle,
          },
          onProgress(bytesUploaded, bytesTotal) {
            setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
          },
          onSuccess() {
            resolve();
          },
          onError(err) {
            reject(err);
          },
        });
        upload.findPreviousUploads().then((prev) => {
          if (prev.length) upload.resumeFromPreviousUpload(prev[0]);
          upload.start();
        });
      });

      // Step 3: Poll for encoding
      setState("processing");
      startPolling(vid);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setState("error");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  async function handleDelete() {
    if (!videoId) return;
    if (!confirm("Remove this video from the lecture?")) return;
    setState("idle");
    setVideoId(null);
    setProgress(0);

    await fetch("/api/video/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, lectureId }),
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (state === "ready" && videoId) {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
        <div className="flex items-start gap-4">
          <img
            src={getBunnyThumbnailUrl(videoId)}
            alt="Thumbnail"
            className="h-20 w-32 flex-shrink-0 rounded-lg object-cover bg-gray-100"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="badge-green">Video ready</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 font-mono">{videoId}</p>
            <button
              onClick={handleDelete}
              className="mt-2 text-xs text-red-500 hover:text-red-700"
            >
              Remove video
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "uploading") {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-700">Uploading…</span>
          <span className="text-sm font-bold text-blue-700">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-blue-100">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-blue-400">
          Do not close this tab until the upload completes.
        </p>
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <div>
            <p className="text-sm font-medium text-amber-700">
              Encoding video… {encodeProgress > 0 ? `${encodeProgress}%` : ""}
            </p>
            <p className="text-xs text-amber-500">
              This takes a few minutes. You can leave this page — the video will be ready when you return.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "creating") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          <p className="text-sm text-gray-600">Preparing upload…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          flex cursor-pointer flex-col items-center justify-center gap-3
          rounded-xl border-2 border-dashed p-8 text-center transition
          ${dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50"
          }
        `}
      >
        <div className="text-4xl text-gray-300">🎬</div>
        <div>
          <p className="font-medium text-gray-700">
            Drop video here or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-400">
            MP4, WebM, MOV or AVI · Max 10 GB · Resumable upload
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}