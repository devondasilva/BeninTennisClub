"use client";

import { useEffect } from "react";
import { RotateCcw, LogOut, Home } from "lucide-react";

/** Affichage commun des erreurs : message clair, code de suivi, actions de sortie */
export default function ErrorPanel({ error, reset, inDashboard = false }: { error: Error & { digest?: string }; reset: () => void; inDashboard?: boolean }) {
  useEffect(() => { console.error("[BTC]", error); }, [error]);
  const dev = process.env.NODE_ENV !== "production";
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="card relative w-full max-w-lg overflow-hidden p-8 text-center md:p-10">
        <div aria-hidden className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-lime/25 blur-3xl" />
        <img src="/images/logo-btc.png" alt="Bénin Tennis Club" className="relative mx-auto h-14 w-auto" />
        <p className="eyebrow relative mt-6">Erreur inattendue</p>
        <h1 className="relative mt-2 font-display text-3xl font-black tracking-tight text-ink">Un incident est survenu</h1>
        <p className="relative mt-3 text-muted">La page n'a pas pu s'afficher. Réessayez ; si le problème continue, déconnectez-vous puis reconnectez-vous.</p>
        {(dev || error.digest) && (
          <pre className="relative mt-5 w-full overflow-auto rounded-2xl bg-mist p-4 text-left text-xs text-muted">
            {dev ? error.message : null}{error.digest ? `\nCode de suivi : ${error.digest}` : null}
          </pre>
        )}
        <div className="relative mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-accent"><RotateCcw size={16} /> Réessayer</button>
          {inDashboard ? (
            <form action="/api/auth/logout" method="post"><button className="btn-ghost"><LogOut size={16} /> Se déconnecter</button></form>
          ) : (
            <a href="/" className="btn-ghost"><Home size={16} /> Accueil</a>
          )}
        </div>
      </div>
    </div>
  );
}
