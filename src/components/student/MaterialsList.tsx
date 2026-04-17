"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Material } from "@/types/database";

interface Props {
  materials: Material[];
  locale: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MaterialsList({ materials, locale }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(material: Material) {
    setDownloading(material.id);
    try {
      const supabase = createClient();
      // Create a signed URL valid for 60 seconds
      const { data, error } = await supabase.storage
        .from("materials")
        .createSignedUrl(material.file_url, 60);

      if (error || !data?.signedUrl) {
        alert("Failed to generate download link. Please try again.");
        return;
      }

      // Open in new tab to trigger download
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = material.file_name;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-2">
      {materials.map((material) => {
        const title =
          locale === "ar" && material.title_ar
            ? material.title_ar
            : material.title;
        const isDownloading = downloading === material.id;

        return (
          <div
            key={material.id}
            className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-400">
                  {material.file_name} · {formatFileSize(material.file_size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(material)}
              disabled={isDownloading}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              {isDownloading ? "..." : "Download"}
            </button>
          </div>
        );
      })}
    </div>
  );
}