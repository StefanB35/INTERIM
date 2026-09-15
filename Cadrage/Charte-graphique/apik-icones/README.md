# Apik — Jeu d'icônes

55 icônes SVG pour le développement et le design de l'app Apik, dans le style
arrondi de la charte graphique.

## Spécifications
- **Format** : SVG optimisé, un fichier par icône
- **Grille** : 24 × 24 px
- **Trait** : 2 px, extrémités et jonctions arrondies (`stroke-linecap/join="round"`)
- **Couleur** : `currentColor` → l'icône prend la couleur du texte parent, recolorable en une ligne
- **Marques** (dossier `marque/`) : couleurs de la charte intégrées (mandarine #FF7A3D, jaune #FFC93C)

## Organisation
- `marque/` — logo app (couleur + monochrome), étincelle, pic
- `produit/` — métier Apik : créneaux, taux d'encadrement, honorabilité, contrats…
- `statuts/` — conforme / hors-taux / validé / favori / évaluation
- `ui/` — navigation et actions courantes

## Recolorer une icône (currentColor)
```html
<span style="color:#FF7A3D">
  <!-- colle ici le contenu du .svg -->
</span>
```
```css
.icone { color: #14B8A6; }   /* toutes les icônes de la classe passent en turquoise */
```

## Utilisation

**HTML (image)**
```html
<img src="produit/creneau.svg" width="24" height="24" alt="Créneau">
```

**HTML inline (recolorable)** — colle le contenu du fichier directement dans le markup.

**React**
```jsx
import { ReactComponent as Creneau } from './produit/creneau.svg';
<Creneau style={{ color: '#FF7A3D', width: 24, height: 24 }} />
```
Ou, plus simple, installer le paquet officiel `lucide-react` : chaque icône a un
équivalent (voir la table de correspondance ci-dessous).

**Figma** — glisser-déposer les .svg dans une page, puis « Create component » pour
constituer la bibliothèque. Le trait reste vectoriel et éditable.

## Correspondance (nom Apik → source Lucide)
Utile pour retrouver l'icône dans `lucide-react` / `lucide` :

produit : creneau=calendar · creneau-confirme=calendar-check · creneau-urgent=calendar-clock ·
publier-creneau=calendar-plus · urgence-horaire=alarm-clock · horaire=clock ·
taux-encadrement=users · animateur=user · animateur-verifie=user-check ·
ajouter-animateur=user-plus · enfant=baby · conformite=shield-check · honorabilite=badge-check ·
diplome-bafa=graduation-cap · contrat=file-text · contrat-signe=file-check · localisation=map-pin ·
carte=map · structure=building-2 · mission=briefcase · missions-liste=list-checks ·
disponibilite=hourglass · remuneration=euro · fiche-contact=contact ·
verification-dossier=clipboard-check · cumul-creneaux=repeat · mise-en-relation=arrow-left-right ·
pic-ligne=mountain-snow

statuts : statut-conforme=circle-check · statut-hors-taux=triangle-alert · valide=check ·
tout-valide=check-check · favori=heart · evaluation=star

ui : recherche=search · filtrer=filter · ajouter=plus · ajouter-cercle=plus-circle ·
notifications=bell · notification-active=bell-ring · messagerie=message-circle · telephone=phone ·
email=mail · parametres=settings · deconnexion=log-out · menu=menu · accueil=house ·
fleche-droite=arrow-right · chevron-droite=chevron-right · fermer=x · aide=circle-help

marque : logo-apik, logo-apik-mono, etincelle, pic (créées pour Apik)

## Licence
Les icônes de ligne dérivent de **Lucide** (licence ISC, libre y compris en usage
commercial, sans obligation d'attribution) — voir `LICENCE-lucide.txt`. Les marques
Apik sont originales et t'appartiennent.

`_planche.png` : aperçu visuel de l'ensemble.
