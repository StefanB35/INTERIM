# Matching Apik

Le moteur suit strictement l'annexe B du cahier des charges : filtres éliminatoires, puis score explicable sur 100.

## Étape 1 : verrous

Un candidat est rejeté si :

1. son honorabilité n'est pas `VERIFIED` ou son attestation est expirée ;
2. son agenda chevauche le créneau demandé ;
3. le plafond de sa catégorie est atteint : 30 % pour les stagiaires, 20 % pour les non qualifiés ;
4. la distance dépasse son rayon déclaré.

Les motifs sont enumérés et affichés en français :

- `HONORABILITY_NOT_VERIFIED` : Honorabilité non vérifiée ;
- `HONORABILITY_EXPIRED` : Attestation d'honorabilité expirée ;
- `AGENDA_CONFLICT` : Conflit ou chevauchement d'agenda ;
- `QUALIFICATION_QUOTA_REACHED` : Plafond de qualification atteint pour cette catégorie ;
- `OUTSIDE_TRAVEL_RADIUS` : Distance hors du rayon d'intervention déclaré.

Un verrou n'est jamais compensé par le score.

## Étape 2 : score

```text
Score = proximité + qualification + expérience + continuité
```

| Composante | Règle | Points |
|---|---|---:|
| Proximité | <= 5 km | 40 |
| Proximité | > 5 et <= 15 km | 25 |
| Proximité | > 15 et <= 30 km | 10 |
| Proximité | > 30 km dans le rayon déclaré | 0 |
| Qualification | Diplômé complet | 30 |
| Qualification | Stagiaire | 20 |
| Qualification | Non qualifié | 10 |
| Expérience | Tranche d'âge exacte | 20 |
| Expérience | Animation générale | 10 |
| Expérience | Débutant | 5 |
| Continuité | Déjà venu dans la structure | 10 |
| Continuité | Nouveau | 0 |

## Exemple de match_run

Document représentatif de la forme MongoDB attendue côté backend. Les DTO frontend portent la même explication, mais le POC utilise une fixture MSW.

```json
{
  "id": "match-run-thu-2026-09-17",
  "missionId": "mission-thu-evening",
  "algorithmVersion": "annexe-b-v1",
  "computedAt": "2026-09-16T08:00:00+02:00",
  "eligible": [
    {
      "id": "animator-sofia-delaunay",
      "name": "Sofia Delaunay",
      "score": 100,
      "scoreBreakdown": {
        "proximity": 40,
        "qualification": 30,
        "experience": 20,
        "continuity": 10
      }
    }
  ],
  "rejected": [
    {
      "id": "animator-ines-boyer",
      "name": "Inès Boyer",
      "reason": "HONORABILITY_EXPIRED",
      "label": "Attestation d'honorabilité expirée"
    },
    {
      "id": "animator-mathis-colin",
      "name": "Mathis Colin",
      "reason": "AGENDA_CONFLICT",
      "label": "Conflit ou chevauchement d'agenda"
    }
  ],
  "totalCandidates": 10
}
```

Dans la démo, Sofia est à 3,1 km de Jacques Prévert, possède un BPJEPS et quatre ans d'expérience. Inès et Mathis sont visibles dans la section des candidats écartés avec leur verrou précis.
