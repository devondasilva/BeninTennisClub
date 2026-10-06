"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, Check } from "lucide-react";
import Avatar from "./Avatar";

/** Recadre l'image au carré (centre) et la redimensionne avant envoi */
async function toSquareDataUrl(file: File, size = 320): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Image illisible"));
      i.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ImagePicker({ value, onChange, presets, name, rounded = true }: {
  value: string | null; onChange: (v: string | null) => void; presets: string[]; name: string; rounded?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError("");
    if (!f.type.startsWith("image/")) return setError("Choisissez une image (JPG, PNG, WebP).");
    if (f.size > 10 * 1024 * 1024) return setError("Image trop lourde (10 Mo maximum).");
    try {
      onChange(await toSquareDataUrl(f));
    } catch {
      setError("Impossible de lire cette image.");
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center gap-3">
        {value ? (
          <img src={value} alt="" className={`h-32 w-32 object-cover ring-4 ring-accent-200 ${rounded ? "rounded-full" : "rounded-2xl"}`} />
        ) : (
          <Avatar name={name} size={128} className="ring-4 ring-accent-200" />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={() => input.current?.click()} className="btn-primary px-3 py-2 text-xs"><Upload size={14} /> Importer une photo</button>
          {value && <button type="button" onClick={() => onChange(null)} className="btn-ghost px-3 py-2 text-xs" title="Retirer la photo"><Trash2 size={14} /></button>}
        </div>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={onFile} />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <div className="flex-1">
        <p className="mb-2 text-sm font-medium text-slate-600">…ou choisissez un avatar</p>
        <div className="grid grid-cols-6 gap-2">
          {presets.map((p) => (
            <button type="button" key={p} onClick={() => onChange(p)}
              className={`relative overflow-hidden ring-offset-2 transition hover:scale-105 ${rounded ? "rounded-full" : "rounded-xl"} ${value === p ? "ring-2 ring-accent-500" : ""}`}>
              <img src={p} alt="" className="aspect-square w-full object-cover" />
              {value === p && <span className="absolute inset-0 flex items-center justify-center bg-primary-400/40 text-white"><Check size={20} /></span>}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">Votre photo est recadrée au carré et compressée automatiquement.</p>
      </div>
    </div>
  );
}
