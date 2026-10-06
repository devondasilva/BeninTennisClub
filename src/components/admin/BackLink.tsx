import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-brand">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/10 bg-white transition group-hover:border-brand"><ArrowLeft size={14} /></span>
      {label}
    </Link>
  );
}
