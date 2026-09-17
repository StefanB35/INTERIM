# Apik

> L'animateur qui arrive à pic.

Apik est un POC de plateforme d'interim pour l'animation periscolaire. Son declencheur n'est pas une intention de recrutement : c'est le calcul du taux d'encadrement. Quand un creneau passe sous le seuil reglementaire, le besoin s'ouvre et le matching explique ses verrous et son score.

## Proposition de valeur

> Permettre à un organisateur d'accueil périscolaire de combler un poste vacant avant le lendemain matin sans sortir de son taux d'encadrement réglementaire, et à un animateur de reconstituer un temps plein en cumulant des créneaux chez plusieurs employeurs.

## Perimetre livre

- Frontend React 18 + TypeScript + Vite dans `apps/web`.
- Design system CSS maison extrait de la charte Apik, avec les polices Fredoka et Inter auto-hébergées en woff2 (`apps/web/public/fonts/`).
- Authentification locale API avec rôles employeur/animateur, inscription et redirections.
- Dashboard employeur, planning de conformité, ouverture automatique d'un besoin, matching explicable et contrat.
- Profil animateur, disponibilités clavier, propositions, agenda et tension ROME G1203.
- Pages publiques `/` et `/missions/:slug`, meta SEO, sitemap et robots.
- Domaine pur testé : encadrement, quotas et matching.
- Mode MSW autonome disponible en activant `VITE_USE_MOCKS=true`.

## Prerequis

- Node.js 20 ou plus récent.
- npm 10 ou plus récent.
- Docker Desktop uniquement pour lancer les services backend locaux.

Aucune clé externe n'est nécessaire pour la démo frontend mockée.

## Vue d'ensemble de l'environnement

| Élément | Adresse/port | Rôle |
|---|---|---|
| Frontend Vite | `http://localhost:5173` | Interface React Apik |
| PostgreSQL | `localhost:5432` | Données relationnelles Prisma |
| MongoDB | `localhost:27017` | Historisation future des `match_runs` |
| Redis | `localhost:6379` | Cache/file prévue |
| n8n | `http://localhost:5678` | Automatisations prévues |
| API Node | `http://localhost:3000` | API Prisma locale |

Le mode base de données utilise `.env` avec `VITE_USE_MOCKS=false` et `VITE_API_URL=http://localhost:3000/api`. Le mode MSW reste disponible avec `VITE_USE_MOCKS=true` pour une démo sans API.

## Installation machine vierge

```bash
npm install
copy .env.example .env
npm run build -w apps/web
```

Sur macOS/Linux, remplacer `copy` par `cp`.

## Lancer la démo sans backend

Le mode recommandé pour la soutenance :

```bash
npm run dev -w apps/web
```

Puis ouvrir `http://localhost:5173/`. Pour forcer explicitement les mocks :

```bash
# PowerShell
$env:VITE_USE_MOCKS="true"; npm run dev -w apps/web

# macOS/Linux
VITE_USE_MOCKS=true npm run dev -w apps/web
```

Les fixtures de démonstration utilisent l'école Jacques Prévert à Villeurbanne, UAI `0692345K`, 214 élèves, Sofia Delaunay et une mission du jeudi soir. Elles vivent dans `apps/web/src/mocks/fixtures.ts`.

### Comptes de connexion de démonstration

Ces comptes sont fournis par MSW, donc ils fonctionnent uniquement avec `VITE_USE_MOCKS=true` :

| Profil | Email | Mot de passe |
|---|---|---|
| Employeur | `direction@jacques-prevert.fr` | `demo1234` |
| Animateur | `animateur@apik.test` | `demo1234` |
| Animateur seed | `alex.dubois@test.apik` | `demo1234` |

Le mot de passe est accepté par le mock et n'est pas vérifié par une base de données.

### Arrêter et redémarrer

Arrêter le serveur frontend : `Ctrl+C` dans le terminal qui exécute Vite.

Arrêter les conteneurs :

```bash
docker compose down
```

Cette commande conserve les volumes Docker. Pour supprimer aussi les données PostgreSQL, MongoDB, Redis et n8n :

```bash
docker compose down -v
```

Redémarrer proprement les conteneurs et le frontend :

```bash
docker compose up -d
npx prisma migrate deploy
npx prisma db seed
npm run dev -w apps/web
```

En cas de `ERR_CONNECTION_REFUSED`, vérifier qu'un seul Vite écoute sur `5173` et relancer la commande frontend. Si le port est occupé, Vite choisit `5174`; utiliser alors l'URL affichée dans le terminal.

En cas de `Le service est momentanément indisponible.` en mode démo :

1. vérifier que l'URL est bien `http://localhost:5173` ;
2. faire un rechargement forcé avec `Ctrl+F5` ;
3. vérifier que `apps/web/.env.local` contient `VITE_USE_MOCKS=true` et `VITE_API_URL=/api` ;
4. arrêter puis relancer Vite pour recharger les variables Vite ;
5. ne pas utiliser `VITE_USE_MOCKS=false` tant que l'API Node n'existe pas.

## Lancer avec l'API

1. Copier `.env.example` vers `.env`.
2. Mettre `VITE_USE_MOCKS=false`.
3. Démarrer l'API avec `npm run dev:api`.
4. Démarrer le frontend dans un autre terminal avec `npm run dev:web`.
5. Pour les services locaux amorcés :

```bash
docker compose up -d
npx prisma migrate deploy
npx prisma db seed
```

Le frontend appelle alors `VITE_API_URL`. L'API locale Prisma expose la session, l'organisation employeur et le profil animateur. Les PUT sauvegardent immédiatement les modifications dans PostgreSQL. Le refresh de session utilise un cookie httpOnly; aucun JWT n'est écrit dans le stockage navigateur.

Le `prisma/seed.ts` contient un jeu backend de test à Rennes. Il est distinct des fixtures MSW Villeurbanne utilisées pour la démo frontend.

### Comptes présents dans le seed PostgreSQL

Le seed crée notamment :

- `directeur@rennes-periscolaire.fr` avec le rôle `EMPLOYER` ;
- `alex.dubois@test.apik`, `sarah.kone@test.apik` et `thomas.leroy@test.apik` avec le rôle `ANIMATOR`.

Leurs `passwordHash` sont des valeurs factices de seed. Ils ne sont donc pas utilisables pour une connexion tant que le backend d'authentification Node n'est pas livré.

## Commandes

```bash
npm run dev -w apps/web
npm run build -w apps/web
npm test -w apps/web
npm run test:coverage -w apps/web
npm run lint -w apps/web
```

Le script PowerShell équivalent à toutes les commandes de démarrage est `scripts/start-project.ps1`. Il exécute `docker compose up -d`, `prisma migrate deploy`, `prisma db seed`, puis `npm run dev -w apps/web`. Par défaut, `Ctrl+C` arrête également les conteneurs; `-KeepContainers` les conserve.

### Lancer tout le projet en une commande Windows

Depuis PowerShell à la racine du dépôt :

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\start-project.ps1
```

Le script démarre Docker, applique les migrations Prisma, charge le seed de démonstration et lance Vite sur `http://localhost:5173/`. `Ctrl+C` arrête Vite puis les conteneurs. Pour conserver les conteneurs après l'arrêt du frontend :

```powershell
.\scripts\start-project.ps1 -KeepContainers
```

### Arrêter tout le projet avec un script

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\stop-project.ps1
```

Ce script arrête le serveur Vite du dépôt et exécute `docker compose down`. Il conserve les volumes de données.

### Redémarrer tout le projet avec un script

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\restart-project.ps1
```

Le redémarrage exécute automatiquement : arrêt du frontend, arrêt des conteneurs, démarrage Docker, migrations Prisma, seed de démonstration et lancement de Vite.

Pour redémarrer en gardant les conteneurs actifs quand le frontend est arrêté :

```powershell
.\scripts\restart-project.ps1 -KeepContainers
```

## Arrêt complet de l'environnement

```bash
# arrêter Vite avec Ctrl+C dans son terminal
docker compose down
```

Pour repartir d'une base vide :

```bash
docker compose down -v
docker compose up -d
npx prisma migrate deploy
npx prisma db seed
```

Le build génère aussi `apps/web/public/sitemap.xml` et `apps/web/public/robots.txt` via `scripts/generate-seo.ts`.

## Arborescence utile

```text
apps/web/src/
  app/                 routeurs et wrappers protégés
  components/          UI et icônes générées
  domain/              calculs métier purs et tests
  features/            auth, employer, animator, public
  lib/                 API, DTO Zod, React Query, SEO
  mocks/               MSW et fixtures de démo
  styles/              tokens, reset, styles globaux
  test/                axe, parcours fonctionnels, setup MSW
prisma/                schéma, migrations et seed backend
scripts/               génération icônes et SEO
docs/                  conformité, éco-conception, RGPD et démo
```

## Documentation de soutenance

- [Accessibilité RGAA](docs/accessibilite.md)
- [Éco-conception RGESN](docs/eco-conception.md)
- [RGPD](docs/rgpd.md)
- [Formule de matching](docs/matching.md)
- [Scénario de démo](docs/demo.md)
- [Cahier des charges](Cadrage/Apik-cahier-des-charges-apik.md)

## Etat réel F1-F16

| Fonction | Etat réel |
|---|---|
| F1 Double parcours | Livré côté frontend; données de structure et profil animateur exposées par l'API Prisma locale. |
| F2 Auth, rôles, JWT | Session API locale par cookie httpOnly et bearer éphémère; remplacer le mot de passe de démonstration et le stockage mémoire avant production. |
| F3 Chiffrement | Schéma Prisma prévu; chiffrement applicatif non implémenté dans ce POC frontend. |
| F4 Annuaire éducation | Fixture et autocomplete MSW livrés; import réel non raccordé au frontend. |
| F5 Profil animateur | Lecture et sauvegarde PUT PostgreSQL livrées via `/api/animators/profile`. |
| F6 Créneaux et missions | Livré côté dashboard/planning mocké; CRUD backend réel non livré. |
| F7 Encadrement et quotas | Calculs purs livrés et testés à 100 %. |
| F8 Matching | Filtres, score et explicabilité livrés dans le domaine et les mocks; exécution backend Mongo non raccordée. |
| F9 Honorabilité | Verrou visible et bloquant dans le matching mocké; consultation TAM réelle absente. |
| F10 Dashboard employeur | Profil organisation lisible et modifiable via `/api/employer/profile`; les autres widgets restent à raccorder aux routes métier. |
| F11 Pages publiques/SEO | Livré avec slugs, meta, sitemap et robots; pas de SSR/prerender. |
| F12 n8n/Discord/confirmation | Timeline de démonstration mockée; workflows n8n opérationnels non livrés. |
| F13 CLI données publiques | Non livré dans ce POC frontend. |
| F14 Responsive | CSS responsive livré et vérifié sur les layouts principaux. |
| F15 RGAA/RGESN | Socle livré, axe et documentation présents; pas d'audit humain exhaustif. |
| F16 Tests | Domaine, axe et 3 parcours nominaux livrés; pas d'E2E navigateur automatisé ni de tests de charge. |

Les lignes ci-dessus sont volontairement factuelles : le mode démo est complet pour le scénario de soutenance, mais plusieurs intégrations backend restent à faire pour une mise en production.

## Vérification de bout en bout (17/09/2026)

La chaîne `docker compose up -d` → `prisma migrate deploy` → `prisma db seed` → `npm run dev:api` a été rejouée intégralement : connexion PostgreSQL confirmée, login réel sur `directeur@rennes-periscolaire.fr` réussi, lecture de `/api/schools` renvoyant les données seedées (« Groupe Scolaire Moulin du Comte »). Une fuite de `passwordHash` dans les réponses `/api/auth/login`, `/api/auth/refresh` et `/api/me` a été détectée et corrigée : ces routes ne renvoient plus que les champs publics de l'utilisateur.

## Ce qui reste pour une mise en production complète

1. Remplacer le mot de passe de développement par Argon2id et externaliser les sessions mémoire vers Redis ou PostgreSQL.
2. Ajouter une validation DTO stricte et le rate limiting côté API.
3. Implémenter le hash Argon2id réel et remplacer les `dummyhash` du seed par un mot de passe de développement documenté.
4. Compléter le CRUD avancé des structures, écoles, groupes, créneaux, missions et contrats.
5. Persister les retraits d'animateur, les candidatures, les décisions de matching et les statuts de contrat.
6. Implémenter l'historisation `match_runs` dans MongoDB et le moteur de matching côté backend.
7. Implémenter le chiffrement applicatif des pièces d'identité et coordonnées bancaires.
8. Livrer le CLI France Travail/Annuaire, son nettoyage, sa pagination et sa planification d'import.
9. Configurer les workflows n8n réels : Discord, génération de confirmation, reprise sur erreur et relance.
10. Ajouter la signature, les notifications réelles, les contrôles TAM et la gestion RGPD opérationnelle.
11. Compléter les tests d'intégration API, E2E navigateur, erreurs, charge et audit humain RGAA.
