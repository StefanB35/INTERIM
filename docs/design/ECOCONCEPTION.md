# Eco-conception du design system

Le détail RGESN reste dans [../eco-conception.md](../eco-conception.md).

- Le pipeline d'icônes produit des SVG inline et un sprite unique.
- Aucun CDN de police n'est chargé.
- Les routes React sont lazy-loadées.
- React Query réutilise les résultats pendant 30 secondes.
- Les tokens centralisent les valeurs et limitent la duplication CSS.
- Les builds Vite minifient les chunks par route.

Les fontes Inter/Fredoka woff2 auto-hébergées ne sont pas encore présentes dans le dépôt : leur ajout nécessite les fichiers de distribution autorisés.
