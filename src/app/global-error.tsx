"use client";
// Dernier filet de sécurité : erreur dans la mise en page racine elle-même
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#f8fafc", color: "#1E3A5F" }}>
        <div style={{ textAlign: "center", padding: 24, maxWidth: 480 }}>
          <h1>Un incident est survenu</h1>
          <p style={{ color: "#64748b" }}>L'application n'a pas pu démarrer correctement.</p>
          {error.digest && <p style={{ fontSize: 12, color: "#94a3b8" }}>Code de suivi : {error.digest}</p>}
          <button onClick={reset} style={{ marginTop: 16, padding: "10px 18px", borderRadius: 12, border: 0, background: "#C8D965", fontWeight: 700, cursor: "pointer" }}>Réessayer</button>
        </div>
      </body>
    </html>
  );
}
