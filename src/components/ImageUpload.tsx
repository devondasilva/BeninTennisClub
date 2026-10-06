"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, ImageIcon } from "lucide-react";

/**
 * Envoi d'image redimensionnée dans le navigateur.
 * mode "cover" : recadrage au ratio demandé (bannières) · mode "contain" : image entière (logos)
 */
async function resize(file: File, maxW: number, ratio: number | null, mode: "cover" | "contain", type: string) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; });
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (mode === "cover" && ratio) {
      if (sw / sh > ratio) { sw = sh * ratio; sx = (img.naturalWidth - sw) / 2; } else { sh = sw / ratio; sy = (img.naturalHeight - sh) / 2; }
    }
    const w = Math.min(maxW, sw), h = Math.round((w * sh) / sw);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    return c.toDataURL(type, 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ImageUpload({ label, hint, value, onChange, ratio, maxWidth, mode, previewClass }: {
  label: string; hint: string; value: string | null; onChange: (v: string | null) => void;
  ratio: number | null; maxWidth: number; mode: "cover" | "contain"; previewClass: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError("");
    if (!f.type.startsWith("image/")) return setError("Choisissez une image (JPG, PNG, WebP).");
    if (f.size > 15 * 1024 * 1024) return setError("Image trop lourde (15 Mo maximum).");
    try {
      onChange(await resize(f, maxWidth, ratio, mode, mode === "contain" ? "image/png" : "image/jpeg"));
    } catch {
      setError("Impossible de lire cette image.");
    }
  }

  return (
    <div>
      <p className="label">{label}</p>
      <div className={`relative flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 ${previewClass}`}>
        {value ? (
          <img src={value} alt="" className={`h-full w-full ${mode === "contain" ? "object-contain p-3" : "object-cover"}`} />
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex flex-col items-center gap-1 text-sm text-slate-400 hover:text-primary-400">
            <ImageIcon size={28} /> Cliquez pour choisir une image
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => input.current?.click()} className="btn-primary px-3 py-2 text-xs"><Upload size={14} /> {value ? "Remplacer" : "Importer"}</button>
        {value && <button type="button" onClick={() => onChange(null)} className="btn-ghost px-3 py-2 text-xs"><Trash2 size={14} /> Retirer</button>}
        <span className="text-xs text-slate-400">{hint}</span>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}
