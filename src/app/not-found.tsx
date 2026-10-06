import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <img src="/images/logo.svg" alt="" className="h-16 w-16" />
      <h1 className="mt-6 text-4xl font-bold text-primary-400">Balle out !</h1>
      <p className="mt-2 text-slate-500">Cette page n'existe pas.</p>
      <Link href="/dashboard" className="btn-accent mt-6">Retour au tableau de bord</Link>
    </div>
  );
}
