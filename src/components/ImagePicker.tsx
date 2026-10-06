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
          <img src={value} alt="" className={`h-32 w-32 object-cover shadow-lg shadow-ink/10 ring-4 ring-brand-light ${rounded ? "rounded-full" : "rounded-[1.75rem]"}`} />
        ) : (
          <Avatar name={name} size={128} className="shadow-lg shadow-ink/10 ring-4 ring-brand-light" />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={() => input.current?.click()} className="btn-primary btn-sm"><Upload size={14} /> Importer une photo</button>
          {value && <button type="button" onClick={() => onChange(null)} className="btn-ghost btn-sm !px-3" title="Retirer la photo" aria-label="Retirer la photo"><Trash2 size={14} /></button>}
        </div>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={onFile} />
        {error && <p role="alert" className="text-xs font-semibold text-red-700">{error}</p>}
      </div>
      <div className="flex-1">
        <p className="label">…ou choisissez un avatar</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {presets.map((p, i) => (
            <button type="button" key={p} onClick={() => onChange(p)} aria-pressed={value === p} aria-label={`Choisir l'illustration ${i + 1}`}
              className={`relative overflow-hidden bg-mist ring-offset-2 transition hover:scale-105 ${rounded ? "rounded-full" : "rounded-xl"} ${value === p ? "ring-[3px] ring-brand" : "hover:ring-2 hover:ring-ink/15"}`}>
              <img src={p} alt="" className="aspect-square w-full object-cover" />
              {value === p && <span className="absolute inset-0 flex items-center justify-center bg-ink/45 text-white"><Check size={20} strokeWidth={3} /></span>}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Votre photo est recadrée au carré et compressée automatiquement.</p>
      </div>
    </div>
  );
}
