# Accessibilite du design system

Le détail RGAA reste dans [../accessibilite.md](../accessibilite.md). Cette page décrit l'impact des primitives.

- Focus visible global et skip link sur chaque layout.
- Contrôles natifs et labels associés.
- `forwardRef` sur les champs pour le focus d'erreur.
- `aria-describedby` et `aria-invalid` sur les champs et selects.
- Modal avec `role=dialog`, `aria-modal`, focus initial, piège Tab et Échap.
- Tabs avec `role=tablist`, `role=tab`, `aria-selected` et navigation fléchée.
- Planning et disponibilités avec informations textuelles, sans dépendance à la couleur seule.
- Toasts et compteurs dynamiques annoncés par `aria-live`.

La suite axe couvre les écrans publics, auth, employeur, animateur et styleguide. Les tests lecteurs d'écran réels et l'audit humain RGAA exhaustif restent à faire.
