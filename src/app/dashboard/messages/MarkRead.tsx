"use client";

import { useRouter } from "next/navigation";

export default function MarkRead({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button onClick={async () => { await fetch("/api/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); router.refresh(); }}
      className="text-xs font-semibold text-primary-400 hover:underline">Marquer comme lu</button>
  );
}
