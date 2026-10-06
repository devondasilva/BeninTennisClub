# 🎾 Bénin Tennis Club

Plateforme du club : réservation de courts, événements, boutique, coachs et commissions, cordage, collectes, paiements MTN Mobile Money et carte.

**Stack :** Next.js 15 · React 19 · TypeScript · Tailwind CSS · Drizzle ORM · SQLite (libSQL) · JWT (cookie httpOnly) · Zod · Stripe · MTN MoMo · Nodemailer

---

## Démarrage en 3 commandes

Prérequis : **Node.js 20 ou plus récent** ([nodejs.org](https://nodejs.org)). Rien d'autre à installer : pas de PostgreSQL, pas de Docker.

```bash
npm install
npm run setup      # crée la base SQLite (btc.db) et charge les données de démo
npm run dev
```

Ouvrez **http://localhost:3000**.

### Comptes de démonstration (mot de passe `demo1234`)

| E-mail | Rôle | Ce qu'il voit en plus |
|---|---|---|
| `client@btc.bj` | Adhérent | Son espace : réservations, achats, dons… |
| `admin@btc.bj` | Administrateur | Adhérents (avec changement de rôle), statistiques, commissions, partenaires, toutes les réservations et transactions |
| `manager@btc.bj` | Gestionnaire | Tous les outils de gestion, sauf l'attribution des accès et le journal |
| `coach@btc.bj` | Coach | Sa fiche coach et ses commissions |
| `boutique@btc.bj` | Adhérent avec accès précis | Uniquement les articles de la boutique et les commandes |

La page de connexion propose aussi des boutons de connexion en un clic.

---

## Site public

| Page | Contenu |
|---|---|
| `/` Accueil | Présentation, services, courts, aperçu des coachs, événements, partenaires |
| `/club` Le club | Mission, valeurs, histoire, installations, bureau |
| `/coachs` Nos coachs & formateurs | Les 6 coachs avec note, spécialité, expérience, langues, tarif |
| `/coachs/[id]` Fiche coach | Biographie, diplômes, palmarès, disponibilités, avis des membres, bouton « Réserver un cours » (coach présélectionné) |
| `/tarifs` | Adhésions, location de courts, cours et stages, cordage |
| `/evenements` | Agenda public avec inscription |
| `/evenements/[id]` | Fiche détaillée d'un événement : description complète, horaires, places restantes, inscription |
| `/partenaires` | Partenaires du club et offres « Devenir partenaire » |
| `/contact` | Coordonnées et formulaire (messages visibles par l'équipe dans *Messages du site*) |

Les textes et tarifs éditoriaux (adhésions, histoire, valeurs, bureau…) sont regroupés dans `src/lib/club.ts`.

## Administration : contrôle total et accès précis

Le **Centre de contrôle** (menu « Gestion du club ») regroupe tous les outils :

| Outil | Ce qu'on peut faire |
|---|---|
| Articles de la boutique | Ajouter, modifier (photo, prix, stock, catégorie), retirer de la vente, supprimer |
| Commandes | Marquer expédiée / livrée, annuler (remise en stock + remboursement), client prévenu |
| Coachs | Ajouter un coach (photo, diplômes, tarifs) et lui créer son accès avec un mot de passe provisoire ; modifier ou masquer une fiche |
| Courts & tarifs | Ajouter un court, changer le prix des créneaux, la photo, fermer un court |
| Événements & inscrits | Créer, modifier, annuler (inscrits prévenus et remboursés), liste des inscrits, export Excel |
| Réservations | Toutes les réservations du club, annulation |
| Adhérents & accès | Créer un compte, modifier les infos, changer le rôle, **donner des accès précis**, suspendre, réinitialiser le mot de passe, supprimer |
| Paiements | Tous les paiements, **encaisser en espèces** un paiement en attente, rembourser |
| Collectes | Lancer, modifier, clôturer |
| Partenaires & pub | Voir la section suivante |
| Infos du club | Coordonnées, horaires et formules d'adhésion affichés sur le site |
| Journal d'activité | Qui a fait quoi, et quand (administrateur) |

**Accès précis.** Chaque rôle fournit des accès par défaut (Administrateur : tout ; Gestionnaire : tout sauf les accès ; Personnel : réservations, cordage, commandes, messages). Sur la fiche d'un membre, l'administrateur peut cocher un ou plusieurs accès en plus, parmi 15 : Adhérents, Infos du club, Messages, Statistiques, Courts, Réservations, Événements, Coachs, Commissions, Atelier cordage, Articles, Commandes, Paiements, Collectes, Partenaires. Exemple : un bénévole qui tient la boutique reçoit « Articles » et « Commandes » et ne voit que ces deux outils. Les changements s'appliquent immédiatement, chaque page et chaque action sont vérifiées côté serveur, et toutes les actions sont inscrites au journal.

Les photos envoyées depuis l'administration (articles, courts, événements, collectes) sont enregistrées dans le dossier `uploads/` du projet. Sauvegardez-le avec la base `btc.db`.

## Partenaires & espaces publicitaires

Le gérant (et l'administrateur) gère les partenaires dans **Partenaires & pub** :
- **ajouter / modifier / désactiver / supprimer** un partenaire ;
- importer son **logo** et sa **bannière publicitaire** (recadrée automatiquement au format 4:1) ;
- choisir **où la bannière s'affiche** : Accueil du site, Événements, Fiches coachs, Tableau de bord des membres, Boutique ;
- fixer les **dates du contrat** : la bannière n'est diffusée qu'entre ces dates ;
- suivre les **affichages, clics et taux de clic** de chaque bannière.

Quand plusieurs partenaires partagent un emplacement, les bannières tournent, avec une priorité selon le niveau (Platine > Or > Argent > Partenaire). Un emplacement sans partenaire affiche « Votre marque ici », avec un lien vers la page *Devenir partenaire*. Chaque bannière porte la mention « Partenaire ».

## Ergonomie

- Chaque carte cliquable affiche un bouton ou un lien explicite (« Voir le détail », « Réserver ce court », « Voir le profil », « Voir la collecte et donner »…).
- Les textes coupés ont un bouton **Voir plus / Voir moins**.
- Fiche produit en boutique (clic sur l'image ou le nom), avec choix de la quantité.
- Les boutons « Réserver ce court » et « Réserver avec ce coach » préremplissent la réservation.
- Les notifications sont cliquables et mènent à la page concernée.
- Navigation au clavier : repère visible sur chaque élément cliquable.

## Profil utilisateur

Dans **Mon profil**, chaque membre peut :
- importer sa propre photo (recadrée au carré et compressée automatiquement dans le navigateur) ou choisir l'un des 12 avatars ;
- modifier son nom, son e-mail, son téléphone, son adresse, son niveau de jeu, sa main et sa présentation ;
- activer ou couper les e-mails de notification ;
- changer son mot de passe.

Les coachs ont en plus **Ma fiche coach** : photo, spécialité, biographie, langues, diplômes, palmarès et disponibilités, publiés directement sur leur page publique. L'équipe du club peut modifier toutes les fiches, ainsi que les tarifs, commissions et la visibilité des coachs.

## Fonctionnalités de l'espace membre

| Module | Détails |
|---|---|
| **Réservations** | 3 courts, créneaux de 30 min de 6 h à minuit, grille des disponibilités en temps réel, coach en option, réservation au moins 1 jour à l'avance, annulation jusqu'à 24 h avant |
| **Paiements** | MTN Mobile Money (demande sur le téléphone puis vérification automatique) et carte via Stripe Checkout. **Mode démo** automatique tant que les clés ne sont pas configurées |
| **Événements** | Tournois, stages, école de tennis, soirées ; places limitées ; inscription gratuite ou payante ; création par le staff |
| **Boutique** | 13 produits illustrés, filtres, panier, livraison offerte dès 50 000 XOF, réservation du stock, suivi de commande |
| **Coachs** | Fiches coachs, ajout par le staff, commissions automatiques à chaque cours payé (À venir → À payer → Payée), règlement groupé |
| **Cordage** | Demande avec type de cordage, tension (15-80 lbs), plan, option express +5 000 XOF ; vue atelier pour suivre les statuts |
| **Collectes** | Cagnottes avec objectif, progression, dons anonymes et messages ; clôture automatique quand l'objectif est atteint |
| **Notifications** | Centre de notifications + e-mail à chaque événement important |
| **Gestion** | Adhérents, statistiques (recettes, répartition, occupation des courts, meilleures ventes), partenaires et sponsors |

---

## Configuration (facultative)

Sans configuration, tout fonctionne en mode démo. Pour activer les vrais services, copiez `.env.example` en `.env` et renseignez :

- **Stripe** : `STRIPE_SECRET_KEY=sk_test_…` (les paiements passent alors par Stripe Checkout). Le webhook est disponible sur `/api/payments/webhook` (`STRIPE_WEBHOOK_SECRET`).
- **MTN MoMo** : clés de l'API Collection (`MTN_MOMO_SUBSCRIPTION_KEY`, `MTN_MOMO_API_USER`, `MTN_MOMO_API_KEY`). Sandbox par défaut ; passez `MTN_MOMO_TARGET_ENV` et `MTN_MOMO_BASE_URL` en production au moment du lancement.
- **E-mails** : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`. Sans SMTP, les e-mails s'affichent dans le terminal.
- **Sécurité** : changez `JWT_SECRET` avant toute mise en ligne.
- **Fuseau horaire** : `CLUB_TIMEZONE` (par défaut `Africa/Porto-Novo`), pour que les horaires restent justes même sur un serveur réglé en UTC.

### Changer le visuel d'accueil

Trois visuels sont fournis dans `public/images/` : `hero-night.svg` (court de nuit sous les projecteurs, utilisé par défaut), `hero-graphic.svg` (court graphique vert citron) et `hero-clay.svg` (gros plan terre battue). Pour en changer, copiez celui de votre choix par-dessus `public/images/hero.svg`. Il est utilisé sur l'accueil, la connexion et le tableau de bord.

Les tarifs (prix par créneau de 30 min) sont stockés par court dans la base : 5 000 XOF pour les courts 1 et 2, 6 000 XOF pour la terre battue.

---

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` puis `npm start` | Version de production |
| `npm run db:reset` | Remet la base à zéro avec les données de démo |
| `npm run db:studio` | Explorer la base dans le navigateur (Drizzle Studio) |
| `npm run db:generate` | Générer une migration après modification de `src/db/schema.ts` |
| `npm run images` | Régénérer les illustrations SVG |

---

## Structure

```
src/
├── app/
│   ├── (site)/                  Site public : accueil, club, coachs, tarifs, événements, contact
│   ├── login/ register/         Authentification
│   ├── dashboard/               Espace membre (une page par module)
│   └── api/                     Routes API (auth, réservations, paiements, boutique…)
├── components/                  Menu latéral, boutons, cartes
├── db/
│   ├── schema.ts                Schéma de la base (18 tables)
│   ├── migrate.ts / seed.ts     Création des tables / données de démo
├── lib/                         Auth JWT, paiements, MTN, Stripe, e-mails, formatage
└── middleware.ts                Protection des pages /dashboard
drizzle/                         Migrations SQL
public/images/                   Illustrations (produits, courts, événements, coachs…)
captures/                        Captures d'écran de toutes les pages
```

## Passer à PostgreSQL ou Turso plus tard

Pour la mise en ligne, le plus simple est **Turso** (libSQL hébergé, aucune modification de code) : renseignez `DATABASE_URL=libsql://…` et `DATABASE_AUTH_TOKEN`. Pour PostgreSQL, adaptez `src/db/schema.ts` (`pg-core`) et `src/db/index.ts` (driver `postgres`).
#   B e n i n T e n n i s C l u b  
 