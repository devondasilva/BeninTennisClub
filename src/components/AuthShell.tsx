import Link from "next/link";

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src="/images/hero.svg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-800/90 via-primary-600/30 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="text-3xl font-bold">« Le tennis, c'est d'abord une famille. »</p>
          <p className="mt-3 text-slate-300">Bénin Tennis Club · Akpakpa Dodomey</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <img src="/images/logo.svg" alt="" className="h-10 w-10" />
            <span className="text-lg font-bold text-primary-400">Bénin Tennis Club</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary-400">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
