// src/components/SupabaseUploader.tsx
"use client";
import { useState } from "react";
import createSupabaseBrowserClient from "@/utils/supabase/client";

type Props = {
  bucket: string;           // ej: "hall"
  folder?: string;          // ej: "2025/08" o el slug
  /** URL a la que se hace POST tras subir el archivo (JSON: { storage_path, media_type }) */
  postUrl?: string;         // ej: `/api/hall/<slug>/media`
  onDone?: (args: { storagePath: string; mediaType: "image" | "video" }) => void;
};

export default function SupabaseUploader({ bucket, folder = "", postUrl, onDone }: Props) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const supa = createSupabaseBrowserClient();

      const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
      const ts = Date.now();
      const path = cleanFolder ? `${cleanFolder}/${ts}-${file.name}` : `${ts}-${file.name}`;

      const { error } = await supa.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || `application/octet-stream`,
      });
      if (error) throw error;

      const mediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
      const storagePath = `${bucket}/${path}`;

      // Si hay postUrl, notifica al backend (API Next)
      if (postUrl) {
        const res = await fetch(postUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ storage_path: storagePath, media_type: mediaType }),
          cache: "no-store",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `POST ${postUrl} failed`);
        }
      }

      onDone?.({ storagePath, mediaType });
      alert("Archivo subido correctamente");
    } catch (e: any) {
      alert("Error subiendo: " + (e?.message || String(e)));
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="border rounded px-3 py-2 cursor-pointer inline-block">
      {uploading ? "Subiendo..." : "Subir foto/video"}
      <input
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
    </label>
  );
}
