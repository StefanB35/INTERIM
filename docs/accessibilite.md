# Accessibilite RGAA 4.1

## Perimetre audite

Les ecrans audites sont : accueil public, fiche mission publique, connexion, inscription structure, inscription animateur, dashboard employeur, planning employeur, fiche mission employeur, profil animateur, disponibilites, propositions, agenda et tension.

Chaque ecran principal est couvert par un test `vitest-axe` dans `src/test/a11y.test.tsx`. Le dernier audit automatise passe sur 15 ecrans : public, auth, employeur, animateur et styleguide.

## Criteres couverts

- **Structure et landmarks** : un `main` par ecran, navigation identifiee, titres hierarchises, un seul `h1` par page publique.
- **Skip link** : lien « Aller au contenu principal » visible au focus, cible `#main-content`.
- **Clavier** : focus-visible global, boutons natifs, liens natifs, grille des disponibilites en `role=grid` avec fleches, Entree et Espace.
- **Focus et erreurs** : resume d’erreurs focusable en haut des formulaires; erreurs reliees par `aria-describedby`.
- **Formulaires** : labels associes aux controles, select, checkbox, radio, dates et fichiers; aucun `div` cliquable.
- **Annonces d’etat** : Toast global en `aria-live=polite`, succes d’inscription en `role=status`, alertes de verrou en `role=alert`, compteurs dynamiques animateur annonces en direct.
- **Information non chromatique** : les cellules du planning affichent « Conforme » ou « Défaut » en texte; les verrous affichent leur statut; les graphiques de score affichent les valeurs numeriques.
- **Alternatives textuelles** : les icones decoratives portent `aria-hidden`; les boutons d’action portent un libelle textuel.

## Contrastes verifies

Ratios calcules selon WCAG 2.x relative luminance. Les textes courants visent au moins 4,5:1; les controles et titres sont testes avec la meme exigence.

| Premier plan | Arriere-plan | Ratio |
|---|---|---:|
| `#1A1B41` Encre | `#FFF7EF` Creme | 15,51:1 |
| `#1A1B41` Encre | `#FFFFFF` Surface | 16,44:1 |
| `#1A1B41` Encre | `#FF7A3D` Mandarine | 6,35:1 |
| `#1A1B41` Encre | `#14B8A6` Turquoise | 6,61:1 |
| `#FFFFFF` Blanc | `#1A1B41` Encre | 16,44:1 |
| `#FFFFFF` Blanc | `#C4302B` Rouge action | 5,52:1 |
| `#0F766E` Turquoise texte | `#D9F5F1` Turquoise pale | 4,76:1 |
| `#0E7C4A` Conforme texte | `#DCF5E8` Conforme pale | 4,57:1 |
| `#8A6500` Alerte texte | `#FFF3D1` Alerte pale | 4,82:1 |
| `#C4302B` Erreur texte | `#FDE3E1` Erreur pale | 4,53:1 |

Les couleurs mandarine, jaune et turquoise claires restent des fonds, accents ou elements decoratifs; elles ne portent pas seules un texte courant.

## Criteres non couverts

- Audit RGAA exhaustif par un expert humain et verification de tous les 106 criteres : hors perimetre du POC de 8 jours.
- Tests avec lecteurs d’ecran reels (NVDA, JAWS, VoiceOver) : non automatisables dans Vitest.
- Documents televerses (PDF, image) : la presence et les dates sont validees; le contenu interne des documents n’est pas audite.
- Zoom 400 %, reflow et modes systeme exotiques : verification manuelle restante avant production.
- Authentification et expiration de session : testes fonctionnellement, mais pas comme audit RGAA de securite.

Ces limites sont a citer en soutenance : le POC couvre les criteres de base observables et automatise les regressions, sans revendiquer une certification RGAA exhaustive.
