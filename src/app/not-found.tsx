import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink p-6 text-center text-white">
      <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div aria-hidden className="absolute -right-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-lime/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-brand/30 blur-3xl" />
      <div className="relative">
        <Logo variant="white" className="mx-auto h-16 w-auto" />
        <p className="mt-10 font-display text-[7rem] font-black leading-none tracking-tight text-lime md:text-[9rem]">404</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white md:text-5xl">Balle out !</h1>
        <p className="mt-3 text-white/70">Cette page n'existe pas.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn-accent">Retour au tableau de bord <ArrowRight size={16} /></Link>
          <Link href="/" className="btn-ghost-dark">Accueil du site</Link>
        </div>
      </div>
    </div>
  );
}
