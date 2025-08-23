// src/components/SupabaseUploader.tsx
"use client";
import { useState } from "react";
import createSupabaseBrowserClient from "@/utils/supabase/client";

type Props = {
  bucket: string;           // ej: "hall"
  folder?: string;          // ej: "2025/08"
  onDone: (args: { storagePath: string; mediaType: "image" | "video" }) => void;
};

export default function SupabaseUploader({ bucket, folder = "", onDone }: Props) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const supa = createSupabaseBrowserClient();

    const ext = file.name.split(".").pop() || "bin";
    const ts = Date.now();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, ""); // sin / al inicio/fin
    const path = cleanFolder ? `${cleanFolder}/${ts}-${file.name}` : `${ts}-${file.name}`;

    const { error } = await supa.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || `application/octet-stream`,
    });

    setUploading(false);

    if (error) {
      alert("Error subiendo archivo: " + error.message);
      return;
    }

    // Devolvemos storagePath completo: "<bucket>/<path>"
    const mediaType: "image" | "video" =
      file.type.startsWith("video/") ? "video" : "image";

    onDone({ storagePath: `${bucket}/${path}`, mediaType });
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
