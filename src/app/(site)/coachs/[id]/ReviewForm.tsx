"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, Send } from "lucide-react";

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
    <form onSubmit={submit} className="rounded-[1.5rem] border border-ink/[0.08] bg-mist p-6">
      <p className="label">{existing ? "Modifier votre avis" : "Laisser un avis"}</p>
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button type="button" key={i} onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} aria-label={`${i} étoiles`} className="rounded-lg p-0.5 transition-transform hover:scale-110">
            <Star size={28} className={(hover || rating) >= i ? "fill-amber-400 text-amber-400" : "fill-cloud text-ink/15"} />
          </button>
        ))}
      </div>
      <textarea className="input mt-4" rows={3} maxLength={500} placeholder="Comment se passent vos cours ?" value={comment} onChange={(e) => setComment(e.target.value)} required minLength={10} />
      {msg && <p className={`mt-3 rounded-2xl px-4 py-2.5 text-sm font-semibold ${msg.ok ? "bg-lime-light text-ink" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button className="btn-primary mt-4" disabled={loading}>{loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />} Publier</button>
    </form>
  );
}
