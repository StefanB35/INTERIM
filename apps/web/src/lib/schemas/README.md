# DTO et Prisma

Les DTO partagent les noms des champs Prisma quand une projection directe est possible.

- `EmployerProfile` est la projection front de `Organization`.
- `School` est la projection front de `Site` et utilise `uaiCode`/`schoolName`.
- `Availability` correspond a `AvailabilityRule`.
- `Candidate` combine `AnimatorProfile` et le resultat de matching.
- `MatchRun` est stocke dans MongoDB, pas dans Prisma.
- `Group` n'existe pas dans Prisma : le POC le projette depuis les effectifs de `CareSession`.
- `TensionIndicator` est la projection front de `MarketIndicator`.
