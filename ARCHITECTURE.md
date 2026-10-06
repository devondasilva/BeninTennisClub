# Architecture — Bénin Tennis Club

Ce document explique **comment l'application est construite et pourquoi**. Il s'adresse au développeur qui reprendra le projet.

## 1. Vue d'ensemble

```
Navigateur ──► middleware.ts ──► Pages (React Server Components) ──► lib/ (règles métier) ──► db/ (collections) ──► data/*.json
     │          (jeton signé ?)        │                                  ▲
     └────────► Routes API (/api/*) ───┘  validation Zod + apiSession() ──┘
```

| Couche | Dossier | Rôle |
|---|---|---|
| Présentation | `src/app`, `src/components` | Pages serveur (lecture directe en base), composants client pour l'interactivité |
| API | `src/app/api` | Toutes les écritures : validation Zod, contrôle des droits, journalisation |
| Domaine | `src/lib` | Permissions, paiements, partenaires, réglages, e-mails, formatage |
| Données | `src/db` | Types, collections JSON, jointures ; démo dans `scripts/seed.mjs` |

**Principe :** les pages *lisent*, les routes API *écrivent*. Chaque écriture passe par `apiSession(permission)`.

## 2. Base de données

Même approche que Beach Tennis Bénin : **un fichier JSON par collection** dans `data/` (livré rempli), lu et écrit avec le module `fs` de Node.js. Aucune dépendance, aucun module natif, aucun moteur SQL.

- **`src/db/store.ts`** — classe `Collection<T>` : `all / get / find / filter / count / sum / insert / update / updateWhere / remove / removeWhere`.
  - Lecture : copie en mémoire, relue dès que le fichier change sur le disque (taille + date), donc une modification à la main est vue tout de suite.
  - Écriture : synchrone (Node.js traite une requête à la fois : pas de conflit d'écriture), atomique (fichier temporaire + renommage), avec reprises en cas de verrou Windows (antivirus, OneDrive).
  - Les dates sont des `Date` en mémoire et des chaînes ISO dans les fichiers ; les champs absents prennent leur valeur par défaut (fichiers anciens ou édités à la main restent compatibles) ; un champ `undefined` dans une modification est ignoré.
  - Les résultats sont des copies : modifier un objet lu ne modifie pas la base.
- **`src/db/index.ts`** — déclare les 20 collections avec leurs valeurs par défaut et leurs champs date.
- **`src/db/relations.ts`** — jointures courantes (`withReservationRefs`, `withOrderRefs`…), tri, suppression d'un membre en cascade.
- **Contraintes** (e-mail unique, un avis par membre et par coach, une inscription par événement, chevauchement des créneaux, stock) : vérifiées dans les routes API.
- **Données de démo** : `scripts/seed.mjs` (Node.js seul). `npm run dev`/`npm start` le lancent automatiquement si `data/users.json` manque ; `npm run reset` régénère tout après une copie de sauvegarde.
- **Limites assumées** : une seule instance du serveur (local, petit hébergement). Pour plusieurs serveurs ou un gros volume, remplacer `src/db/store.ts` par PostgreSQL/Supabase en gardant la même interface.

## 3. Authentification et sessions

1. `POST /api/auth/login` vérifie le mot de passe (scrypt, module crypto de Node.js), limite à 10 tentatives par e-mail sur 15 minutes, puis pose un cookie `btc_token` (jeton signé HMAC-SHA256 via Web Crypto, httpOnly, SameSite=Lax, 7 jours).
2. **Middleware (sans base) :** sur `/dashboard/*`, il vérifie seulement la signature du jeton. Un jeton absent, expiré ou falsifié renvoie vers `/login` et le cookie est effacé.
3. **requireSession() (avec base) :** il relit l'utilisateur à chaque requête, ce qui applique immédiatement un changement de rôle, d'accès ou une suspension.
   - Si le compte a disparu (base réinitialisée) ou est suspendu, il renvoie vers `/api/auth/logout?motif=…`, qui efface le cookie puis affiche `/login` avec un message.
4. **Garantie anti-boucle :** seul le serveur, après vérification en base, peut envoyer un visiteur de `/login` vers l'espace membre. Le middleware ne le fait jamais. Un cookie invalide ne peut donc pas provoquer d'aller-retour infini (scénario testé dans `tests/smoke.mjs`).
5. Les redirections après connexion (`?next=`) n'acceptent que des chemins internes (`lib/safe-redirect.ts`).

## 4. Permissions

- 15 permissions fines (`lib/permissions.ts`), plus `access.manage`, réservée à l'administrateur.
- Droits effectifs = préréglage du rôle + accès accordés un par un (colonne `users.permissions`).
- Pages : `requireSession("shop.manage")`. API : `apiSession("shop.manage")` renvoie 403. Menu : n'affiche que ce qui est autorisé.
- Les actions sensibles sont inscrites dans `admin_logs` (journal visible par l'administrateur).

## 5. Paiements

`lib/payments.ts` crée une transaction `PENDING`, puis la passe en `COMPLETED` (réservation confirmée, stock décrémenté, notification). Sans clé `STRIPE_SECRET_KEY` ou `MTN_SUBSCRIPTION_KEY`, un **mode démonstration** simule la confirmation : le parcours complet reste testable en local.

## 6. Gestion des erreurs

- `app/dashboard/error.tsx`, `app/error.tsx`, `app/global-error.tsx` affichent un message clair, le détail technique en développement, un code de suivi en production, et les boutons Réessayer / Se déconnecter.
- Les routes API renvoient toujours `{ message }` avec un statut HTTP explicite (400, 401, 403, 404, 429).
- `GET /api/health` donne l'état du serveur et de la base (supervision, diagnostic).

## 7. Sécurité

| Mesure | Où |
|---|---|
| Mots de passe hachés (scrypt + sel) | `lib/password.ts` |
| Cookie httpOnly, SameSite=Lax, Secure en production | `api/auth/session.ts` |
| Limitation des tentatives de connexion | `lib/rate-limit.ts` |
| Validation de toutes les entrées (Zod) | `lib/api.ts` + chaque route |
| En-têtes `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | `next.config.mjs` |
| Redirections internes uniquement | `lib/safe-redirect.ts` |
| Fichiers envoyés : nom aléatoire, extension contrôlée | `lib/uploads.ts`, `app/uploads/[name]` |
| Avertissement si `JWT_SECRET` est faible en production | `lib/env.ts` |

**Avant une mise en ligne :** définir `JWT_SECRET` (32 caractères aléatoires ou plus), `APP_URL`, les clés de paiement réelles et un SMTP.

## 8. Qualité

- `npm run check` : TypeScript strict + tests unitaires (Vitest).
- `npm run test:smoke` : contrôle d'un serveur lancé (pages publiques, protection, connexion, espace membre, scénario du cookie périmé).
- **CI GitHub** (`.github/workflows/ci.yml`) : vérification, build, démarrage et test de fumée sous **Linux et Windows**.

## 9. Fuseau horaire

Le club est au Bénin (UTC+1). `TZ` est fixé à `Africa/Porto-Novo` (modifiable avec `CLUB_TIMEZONE`), de sorte que les créneaux affichés restent justes même sur un serveur réglé en UTC. Les éléments qui dépendent de la date du navigateur sont rendus après le montage, pour éviter les écarts d'hydratation.

## 10. Design

Même langage visuel que Beach Tennis Bénin, aux couleurs du logo du club :

| Rôle | Valeur |
|---|---|
| Bleu nuit (textes, fonds sombres) | `#0B2440` (`ink`) |
| Bleu du logo (boutons, liens) | `#1F5996` (`brand`) |
| Vert citron du logo (accents sur fond sombre, mot clé des titres) | `#D5DA45` (`lime`) |
| Fond de page | `#F3F7FB` (`mist`) |
| Titres | Fraunces 900 (`font-display`) |
| Texte | Inter |

- Classes communes dans `src/app/globals.css` (`.btn-primary`, `.btn-accent`, `.card`, `.input`, `.label`, `.eyebrow`, `.section-title`…) et `src/lib/ui.ts`.
- Pages publiques : `PageHero` (bandeau bleu nuit, image voilée en parallaxe, badge citron, titre Fraunces) + `PageBody` (cartes qui remontent sur le bandeau).
- Espace membre et back-office : barre latérale bleu nuit, `PageHeader`, cartes d'indicateurs `StatCard` (la première en sombre).
- Animations Framer Motion (`components/motion/`) ; tout respecte `prefers-reduced-motion`.
- Polices auto-hébergées (`@fontsource`), donc le site s'affiche correctement même sans connexion.
- Logo : `public/images/logo-btc.png` (fond clair), `logo-btc-blanc.png` (fond sombre), `logo-raquette.png` (icône) ; composant `components/Logo.tsx`.
