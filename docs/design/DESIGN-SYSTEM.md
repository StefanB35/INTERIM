# Design system Apik

## Source de vérité

La palette et les primitives de marque viennent de `Cadrage/Charte-graphique/apik-charte-graphique.html` et des SVG présents sous `Cadrage/Charte-graphique/`. Le frontend ne crée pas de second fichier de tokens.

## Palette

- Mandarine 100/300/500/700 : `#FFDECF`, `#FFBD9E`, `#FF7A3D`, `#C2410C`
- Jaune 100/300/500 : `#FFF2CE`, `#FFE49E`, `#FFC93C`
- Turquoise 100/300/500/700 : `#C4EDE9`, `#8ADCD3`, `#14B8A6`, `#0F766E`
- Encre : `#1A1B41`
- Crème : `#FFF7EF`
- Conforme : `#1FB668`
- Hors-taux : `#F0453D`

Les tokens sont dans `apps/web/src/styles/tokens.css`. Les primitives UI nécessaires mais absentes de la charte sont regroupées sous `--ui-*` et signalées comme telles.

## Typographie

- Titres : Fredoka, graisses 400/500/600/700.
- Corps : Inter, graisses 400/500/600/700.
- Corps : line-height 1.6.
- Titres : line-height 1.1 et letter-spacing `-.01em`.
- Données métier : appliquer `font-variant-numeric: tabular-nums`.

Les fichiers woff2 auto-hébergés sont livrés dans `apps/web/public/fonts/` (Fredoka 500/600, Inter 400/500/600) et déclarés en `@font-face` dans `apps/web/src/styles/tokens.css`.

## Primitives

Les composants existants sont dans `apps/web/src/components/ui/` : Button, Input, Select, Checkbox, Radio, DatePicker, Badge, StatusPill, Card, Table, Tabs, Modal, ToastProvider, EmptyState et Skeleton.

Les champs utilisent `forwardRef` pour React Hook Form. Les erreurs sont reliées par `aria-describedby`. Les modales ont un focus trap et se ferment avec Échap. Les onglets utilisent les flèches gauche/droite.

## Icônes

`scripts/build-icons.ts` est l'unique pipeline. Il lit les SVG de la charte, génère les wrappers React, une union `IconName` et `public/icons.svg`. Les icônes de ligne restent en 24x24, `stroke="currentColor"`, trait 2px et extrémités arrondies. Les assets de marque colorés restent séparés des icônes métier.

## Usage

```tsx
<Button variant="primary" size="lg">Publier le créneau</Button>
<Badge tone="success">Équipe conforme</Badge>
<Input label="Email" error={errorMessage} {...register('email')} />
```

Le styleguide `/styleguide` expose les tokens et les primitives disponibles.
