# Scénario de démo en moins de 4 minutes

## Préparation

```bash
npm install
$env:VITE_USE_MOCKS="true"; npm run dev -w apps/web
```

Ouvrir `http://localhost:5173/`, puis utiliser la navigation. Les fixtures sont dans `apps/web/src/mocks/fixtures.ts` : Jacques Prévert, UAI `0692345K`, 214 élèves, jeudi soir à 5 présents pour 6 requis, Sofia Delaunay à 3,1 km et dix profils candidats.

## Suite exacte des clics

1. Depuis l'accueil, cliquer **Se connecter**.
2. Saisir `direction@jacques-prevert.fr` et un mot de passe quelconque, puis cliquer **Se connecter**. Le mock ouvre le dashboard employeur.
3. Cliquer **Planning**.
4. Cliquer la case **5 / 6 · 84 enfants · Défaut** du jeudi soir.
5. Dans le panneau, montrer le seuil **1/18 avec PEDT**, l'écart `-1` et les quotas.
6. Cliquer **Retirer un animateur** sur un créneau conforme. En deux clics, le compteur passe sous le seuil et le toast dit : **Seuil franchi : 1 animateur à trouver. La mission est ouverte automatiquement.**
7. Cliquer **Diffuser le besoin** ou le lien **Mission urgente**.
8. Dans **Candidats compatibles**, montrer Sofia Delaunay en tête : `100/100`, `40 + 30 + 20 + 10`, 3,1 km et 4 ans d'expérience.
9. Ouvrir **Candidats écartés** et montrer Inès : honorabilité expirée, puis Mathis : conflit d'agenda. Insister : aucun score ne peut compenser un verrou.
10. Cliquer **Sélectionner ce candidat** pour Sofia.
11. Montrer le statut **Pourvue**, le toast de conformité, puis la timeline : **Contrat généré**, **Notification Discord**, **Relance J+1**.
12. Lire l'aperçu : motif du recours, qualification BPJEPS, période, lieu, rémunération et période d'essai.

## Transitions à dire

- « Le besoin n'est pas créé par une intention RH : il est ouvert par le calcul. »
- « Le matching commence par les verrous, puis seulement par le score. »
- « La sélection ferme la boucle : mission pourvue, créneau conforme et contrat prêt. »

## Variante animateur

1. Recharger l'accueil et cliquer **Se connecter**.
2. Utiliser `animateur@apik.test` puis cliquer **Se connecter**.
3. Ouvrir **Propositions**, cliquer **Accepter** et montrer le compteur `15,0 h` qui passe à `16,5 h`.
4. Ouvrir **Profil** et montrer les trois verrous réglementaires.

Le scénario principal employeur tient sous quatre minutes en suivant uniquement les clics ci-dessus.
