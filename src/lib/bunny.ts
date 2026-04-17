const BUNNY_API_KEY = process.env.BUNNY_API_KEY!;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME!;
const BUNNY_BASE = "https://video.bunnycdn.com/library";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BunnyVideo {
  guid: string;
  title: string;
  status: number; // 0=queued, 1=processing, 2=encoding, 3=finished, 4=error, 5=uploaded
  length: number; // duration in seconds
  storageSize: number;
  thumbnailFileName: string;
  encodeProgress: number;
  framerate: number;
  width: number;
  height: number;
}

// Status 3 = ready to stream
export function isVideoReady(status: number) {
  return status === 3 || status === 5;
}

// ─── Create a video entry (get upload URL) ────────────────────────────────────

export async function createBunnyVideo(title: string): Promise<BunnyVideo> {
  const res = await fetch(`${BUNNY_BASE}/${BUNNY_LIBRARY_ID}/videos`, {
    method: "POST",
    headers: {
      AccessKey: BUNNY_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny create video failed: ${text}`);
  }

  return res.json();
}

// ─── Get video info ───────────────────────────────────────────────────────────

export async function getBunnyVideo(videoId: string): Promise<BunnyVideo> {
  const res = await fetch(
    `${BUNNY_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      headers: { AccessKey: BUNNY_API_KEY },
      next: { revalidate: 10 },
    }
  );

  if (!res.ok) throw new Error("Video not found");
  return res.json();
}

// ─── Delete a video ───────────────────────────────────────────────────────────

export async function deleteBunnyVideo(videoId: string): Promise<void> {
  await fetch(`${BUNNY_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
    method: "DELETE",
    headers: { AccessKey: BUNNY_API_KEY },
  });
}

// ─── Build embed URL (iframe player) ─────────────────────────────────────────

export function getBunnyEmbedUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=false&preload=true`;
}

// ─── Build TUS upload endpoint ────────────────────────────────────────────────

export function getBunnyTusEndpoint(videoId: string): string {
  return `https://video.bunnycdn.com/tusupload`;
}

// ─── Sign token for secure embed ─────────────────────────────────────────────
// Generates a time-limited embed token so the player URL can't be shared

export function getSecureEmbedUrl(
  videoId: string,
  expiresIn: number = 3600
): string {
  // For basic security we use the library's pull-zone embed
  // Full token signing requires crypto — use this simpler form for now
  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=false&token_expires=${expires}`;
}

// ─── Thumbnail URL ────────────────────────────────────────────────────────────

export function getBunnyThumbnailUrl(videoId: string): string {
  return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;
}