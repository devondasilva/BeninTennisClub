"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";

export default function ReviewForm({ coachId, existing }: { coachId: string; existing?: { rating: number; comment: string } }) {
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/coaches/${coachId}/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, comment }) });
    const data = await res.json();
    setMsg({ ok: res.ok, text: data.message });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-slate-50 p-5">
      <p className="font-semibold text-primary-400">{existing ? "Modifier votre avis" : "Laisser un avis"}</p>
      <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button type="button" key={i} onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} aria-label={`${i} étoiles`}>
            <Star size={26} className={(hover || rating) >= i ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
          </button>
        ))}
      </div>
      <textarea className="input mt-3" rows={3} maxLength={500} placeholder="Comment se passent vos cours ?" value={comment} onChange={(e) => setComment(e.target.value)} required minLength={10} />
      {msg && <p className={`mt-2 text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
      <button className="btn-primary mt-3" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Publier</button>
    </form>
  );
}
