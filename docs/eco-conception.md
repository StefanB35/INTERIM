# Eco-conception RGESN

## Pratiques appliquees

### 1. Assets legers et formats modernes

- Aucune police n’est chargee depuis un CDN tiers : le `@import` Google Fonts a ete retire. Le rendu utilise les polices locales disponibles puis des fallbacks systeme.
- Les 55 icones de la charte sont des SVG inline generes dans des composants React. Il n’y a pas de raster ou de copie bitmap dans le parcours public.
- Vite minifie CSS et JavaScript en production; les SVG restent vectoriels et evitent le poids d’images de substitution.

### 2. Reduire les requetes et le JavaScript initial

- Les pages sont chargees par route via `React.lazy` et `Suspense` : public, employeur, animateur et styleguide sont dans des chunks separes.
- React Query utilise un `staleTime` de 30 secondes et `retry: 1` pour eviter les refetch immediats; les mutations ont `retry: 0`.
- Les listes exposent `data` et `total` dans le contrat API afin de supporter une pagination serveur sans charger toute la collection. Les ecrans de liste affichent uniquement la page courante de demonstration.
- MSW et l’API reelle partagent les memes endpoints : aucun appel France Travail n’est effectue directement depuis le navigateur.

## Mesure avant / apres

Mesure realisee avec `npm run build -w apps/web`, sur les artefacts Vite minifies.

| Indicateur | Avant lazy loading | Apres |
|---|---:|---:|
| Entree JavaScript | 386,07 kB / 119,03 kB gzip | 278,42 kB / 86,20 kB gzip |
| CSS d’entree | 25,54 kB / 5,24 kB gzip | 1,93 kB / 0,92 kB gzip |
| Chunks de route | 0 | Public, employeur, animateur, styleguide |
| Requetes de code au premier affichage public | bundle monolithique | entree + CSS entree; chunk public charge a la route mission |

La comparaison est reproductible : le tableau de sortie Vite liste les chunks et leurs tailles. Les donnees metier restent cachees 30 secondes par React Query; les routes publiques ne chargent pas les ecrans proteges avant navigation.

## Limites

Le POC ne mesure pas encore l’empreinte carbone en grammes, le poids reseau sur une connexion 3G reelle ni la consommation CPU d’un appareil bas de gamme. Ces mesures font partie de la recette avant mise en production.
