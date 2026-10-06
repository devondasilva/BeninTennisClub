import Link from "next/link";
import Logo from "@/components/Logo";

/** Pages de connexion / inscription : photo du club à gauche, formulaire à droite */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img src="/images/hero.svg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="court-lines-dark absolute inset-0 opacity-40" aria-hidden />
        <div aria-hidden className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-lime/15 blur-3xl" />
        <div className="absolute bottom-14 left-14 right-14 text-white">
          <p className="font-display text-4xl font-black leading-tight">« Le tennis, c'est d'abord <span className="text-lime">une famille.</span> »</p>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-white/60">Bénin Tennis Club · Akpakpa Dodomey</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-mist px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-block" aria-label="Accueil"><Logo className="h-14 w-auto" /></Link>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink">{title}</h1>
          <p className="mt-3 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
