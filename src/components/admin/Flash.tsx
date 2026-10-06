import { CheckCircle2 } from "lucide-react";

export default function Flash({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p role="status" className="mb-6 flex items-center gap-3 rounded-2xl border border-lime-dark/30 bg-lime-light px-4 py-3 text-sm font-semibold text-ink">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-lime"><CheckCircle2 size={16} /></span>
      {text}
    </p>
  );
}
