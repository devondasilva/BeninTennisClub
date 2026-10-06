import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-400"><ArrowLeft size={16} /> {label}</Link>;
}
