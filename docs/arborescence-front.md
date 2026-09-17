# Arborescence du frontend Apik

Frontend situé dans `apps/web/`.

Les dossiers générés ou volumineux comme `node_modules/`, `dist/` et `coverage/` ne sont pas détaillés ici.

```text
apps/web/
├── public/
│   ├── fonts/
│   ├── icons.svg
│   ├── logo-apik.svg
│   ├── mockServiceWorker.js
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── app/
│   │   ├── App.css
│   │   └── Styleguide.tsx
│   ├── components/
│   │   ├── icons/
│   │   │   ├── index.ts
│   │   │   └── *.tsx
│   │   └── ui/
│   │       ├── index.tsx
│   │       └── ui.css
│   ├── domain/
│   │   ├── matching.ts
│   │   ├── matching.test.ts
│   │   ├── qualificationQuota.ts
│   │   ├── qualificationQuota.test.ts
│   │   ├── supervisionRatio.ts
│   │   └── supervisionRatio.test.ts
│   ├── features/
│   │   ├── animator/
│   │   │   ├── AnimatorPages.tsx
│   │   │   ├── animator.css
│   │   │   ├── useAnimatorData.ts
│   │   │   └── useAnimatorProposals.ts
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── auth.css
│   │   │   ├── pages.tsx
│   │   │   └── schemas.ts
│   │   ├── employer/
│   │   │   ├── EmployerPages.tsx
│   │   │   ├── employer.css
│   │   │   ├── hooks.ts
│   │   │   └── index.ts
│   │   ├── matching/
│   │   │   └── useMatchRun.ts
│   │   ├── missions/
│   │   │   └── useMissions.ts
│   │   ├── public/
│   │   │   ├── PublicPages.tsx
│   │   │   └── public.css
│   │   ├── queryKeys.ts
│   │   └── sessions/
│   │       └── useSessions.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   ├── queryClient.ts
│   │   ├── schemas/
│   │   │   ├── index.ts
│   │   │   └── README.md
│   │   └── seo.ts
│   ├── mocks/
│   │   ├── browser.ts
│   │   ├── fixtures.ts
│   │   ├── handlers.ts
│   │   └── index.ts
│   ├── styles/
│   │   ├── global.css
│   │   ├── reset.css
│   │   └── tokens.css
│   ├── test/
│   │   ├── a11y.test.tsx
│   │   ├── criticalJourneys.test.tsx
│   │   └── setup.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.local
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Responsabilités

### `src/app/`

Configuration applicative et page styleguide. Le routage principal est dans `src/App.tsx`; les wrappers d'authentification sont dans `features/auth/AuthProvider.tsx`.

### `src/components/`

- `ui/` : primitives accessibles réutilisables : boutons, champs, cartes, badges, tableaux, onglets, modal, toast, skeleton.
- `icons/` : wrappers React générés depuis `Cadrage/Charte-graphique/apik-icones/` par `scripts/build-icons.ts`.

### `src/domain/`

Calculs métier purs sans React :

- taux d'encadrement et déclenchement d'un besoin ;
- quotas de qualification ;
- verrous et score de matching.

### `src/features/`

Organisation par parcours métier :

- `auth/` : connexion, rôles, inscription employeur et animateur ;
- `employer/` : dashboard, planning, conformité, candidats et contrat ;
- `animator/` : profil, disponibilités, propositions, agenda et tension ;
- `public/` : accueil et fiches mission indexables ;
- `missions/`, `matching/`, `sessions/` : hooks React Query spécialisés.

### `src/lib/`

Services transverses :

- client fetch et gestion du JWT mémoire ;
- schémas Zod et DTO ;
- cache React Query ;
- métadonnées SEO dynamiques.

### `src/mocks/`

Fixtures réalistes de démonstration et handlers MSW. Le frontend utilise ces handlers en développement lorsque `VITE_USE_MOCKS` n'est pas `false`.

### `src/styles/`

- `tokens.css` : tokens extraits de la charte graphique ;
- `reset.css` : remise à zéro navigateur ;
- `global.css` : styles globaux, focus visible et skip link.

### `src/test/`

- audits axe des écrans principaux ;
- tests Testing Library/MSW des trois parcours critiques ;
- setup Vitest et serveur MSW Node.

## Fichiers de configuration

- `vite.config.ts` : Vite, React et Vitest ;
- `tsconfig*.json` : TypeScript strict ;
- `package.json` : scripts frontend ;
- `.env.local` : configuration locale non versionnée ;
- `index.html` : document HTML d'entrée.

## Commandes utiles

```powershell
npm run dev -w apps/web
npm run build -w apps/web
npm test -w apps/web
npm run test:coverage -w apps/web
```
