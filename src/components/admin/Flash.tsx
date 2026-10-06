import { CheckCircle2 } from "lucide-react";

export default function Flash({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><CheckCircle2 size={18} /> {text}</p>;
}
