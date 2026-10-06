"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

export default function MarkRead({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button disabled={loading} onClick={async () => { setLoading(true); await fetch("/api/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); router.refresh(); }}
      className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-brand ring-1 ring-inset ring-ink/[0.08] transition hover:bg-ink hover:text-white disabled:opacity-60">
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Marquer comme lu
    </button>
  );
}
