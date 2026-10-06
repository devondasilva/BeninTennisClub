import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { toCoachForm } from "@/lib/coach-form";
import { PageHeader } from "@/components/ui";
import CoachProfileForm from "@/components/CoachProfileForm";

export const metadata = { title: "Modifier un coach" };

export default async function EditCoachPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("coaches.manage");
  const c = await db.query.coaches.findFirst({ where: eq(t.coaches.id, (await params).id) });
  if (!c) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/coaches" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-400"><ArrowLeft size={16} /> Coachs</Link>
      <PageHeader title={`${c.firstName} ${c.lastName}`} subtitle="Modifier la fiche coach" />
      <CoachProfileForm coach={toCoachForm(c)} staff />
    </div>
  );
}
