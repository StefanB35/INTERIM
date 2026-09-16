# Cahier des charges — Apik

> *L'animateur qui arrive à pic.*

**Livrable J+2 — Roadmap fonctionnelle et chiffrage estimé du temps de travail**
Secteur retenu : animation périscolaire. Document soumis au point go/nogo.

---

## 1. Objet du document

Ce cahier des charges fige, à J+2, trois choses :

1. le **périmètre fonctionnel** du POC, avec ce qui est explicitement hors périmètre ;
2. le **chiffrage estimé** du temps de travail, module par module, en jours-homme ;
3. la **confrontation charge / capacité** sur les 8 jours de production restants, avec le plan de repli pré-arbitré.

Le cadrage amont (choix du secteur, étude de marché, proposition de valeur, source de données publique, stack) est clos. Il est repris en synthèse au chapitre 2 et détaillé dans le livrable *Dossier d'étude de marché*.

---

## 2. Rappel du cadrage

**Secteur.** L'animation périscolaire au sens du décret n° 2014-1320 : accueil du matin, pause méridienne, accueil du soir, mercredi avec classe le matin. Métier de référence : ROME **G1203**.

**Pourquoi ce secteur.** Le périscolaire cumule une pénurie structurelle de main-d'œuvre (≈ 50 000 postes vacants en 2021-2022, 69 % des structures encore en difficulté selon le baromètre Hexopée 2024) **et** une obligation réglementaire d'effectif. Un animateur absent ne dégrade pas le service : il place l'organisateur en non-conformité. Le déclencheur du recrutement n'est donc pas une intention, c'est un calcul — ce qu'aucun acteur du marché ne fait aujourd'hui.

**Proposition de valeur (phrase de référence, identique dans le pitch et le README).**

> Permettre à un organisateur d'accueil périscolaire de combler un poste vacant avant le lendemain matin sans sortir de son taux d'encadrement réglementaire, et à un animateur de reconstituer un temps plein en cumulant des créneaux chez plusieurs employeurs.

**Cibles.** Employeurs : associations gestionnaires par délégation (Léo Lagrange, IFAC, Francas, Ligue de l'enseignement, UFCV, PEP), employeurs de droit privé sous convention ÉCLAT. Offre : animateurs professionnels titulaires du BAFA, CPJEPS ou BPJEPS.

**Données publiques consommées.**

| Source | Format | Usage produit dans le POC |
|---|---|---|
| API France Travail, offres ROME G1203 | JSON / REST | Alimentation du flux de missions et indicateur de tension par zone |
| Annuaire de l'éducation (data.gouv.fr) | CSV / API | **Pré-remplissage de l'inscription employeur** : l'organisateur saisit son école, la fiche structure se remplit seule (UAI, adresse, commune, géolocalisation) |

Conformément au sujet, la donnée n'est pas affichée brute : elle alimente une fonctionnalité visible (pré-remplissage) et un critère de matching (distance calculée depuis la géolocalisation de l'établissement).

---

## 3. Périmètre du POC

### 3.1 Dans le périmètre

| # | Fonctionnalité | Justification |
|---|---|---|
| F1 | Double parcours d'inscription : **structure** (employeur) et **animateur** | Exigence du sujet |
| F2 | Authentification par email/mot de passe, hachage, JWT, gestion des rôles et permissions | Exigence du sujet, implémentée par nos soins |
| F3 | Chiffrement applicatif des données sensibles (pièces d'identité, coordonnées bancaires) au repos et en transit | Exigence du sujet |
| F4 | Fiche structure pré-remplie depuis l'Annuaire de l'éducation | Exploitation de la donnée publique |
| F5 | Profil animateur : diplômes, tranches d'âge maîtrisées, disponibilités récurrentes, rayon d'intervention, statut d'honorabilité | Alimente le matching |
| F6 | Déclaration de créneaux et de missions (poste, dates, lieu, effectif enfants, tranche d'âge, rémunération) | Exigence du sujet |
| F7 | **Calculateur de taux d'encadrement** (décret 2016-1051, avec/sans PEDT) et de quotas de qualification (art. R227-12) | Différenciateur produit |
| F8 | **Moteur de matching** : verrous bloquants puis score pondéré sur 100 | Exigence du sujet + différenciateur |
| F9 | Verrou d'honorabilité bloquant (art. R227-3) | Placement d'adultes auprès de mineurs : traité comme filtre, jamais comme score |
| F10 | Tableau de bord employeur : état des missions (ouverte / pourvue / terminée) et voyant de conformité | Exigence du sujet |
| F11 | Pages publiques des missions et page d'accueil, SEO on-page | Exigence du sujet |
| F12 | Deux automatisations n8n : alerte de match sur Mail, génération de la fiche de confirmation de mission | Exigence du sujet |
| F13 | CLI d'import et de nettoyage des données publiques | Exigence du sujet |
| F14 | Interface responsive mobile / tablette / desktop | Exigence du sujet |
| F15 | Accessibilité RGAA 4.1 (critères de base) et deux pratiques RGESN documentées | Exigence du sujet |
| F16 | Tests unitaires, tests fonctionnels sur 3 parcours critiques, rapport de couverture | Exigence du sujet |

### 3.2 Hors périmètre, et pourquoi

| Écarté | Motif |
|---|---|
| Agrégation multi-employeurs côté animateur (construction d'un temps plein) | Différenciateur fort mais coûteux (2 j/h). Reporté en V2, présenté en soutenance comme trajectoire produit, pas comme fonctionnalité livrée |
| Signature électronique du contrat de mission | Hors cœur de la démonstration, dépendance à un tiers payant |
| Paiement, facturation, gestion de paie | Un POC de 11 jours ne peut pas porter un flux financier crédible |
| Connexion à la téléprocédure TAM | Accès réservé aux organisateurs déclarés, non ouvrable dans le cadre du projet. Le statut d'honorabilité est saisi et daté manuellement par la structure, avec preuve déposée |
| Colonies, camping, événementiel, petite enfance | Régimes contractuels distincts (CEE, CDD d'usage), justifié dans l'étude de marché |
| Messagerie interne employeur / animateur | Remplacée par la notification Mail et le cycle de mission |
| Application mobile native | Le responsive couvre l'exigence |

---

## 4. Roadmap fonctionnelle et chiffrage estimé

### 4.1 Méthode de chiffrage

- Unité : **jour-homme (j/h) = 7 heures de travail effectif**.
- Source : backlog ClickUp de 98 tâches, estimées tâche par tâche puis agrégées par module.
- Les estimations exprimées en `Xj30m` dans l'export sont lues comme **X jours et demi**.
- Le chiffrage couvre développement, intégration et auto-revue ; il n'inclut ni les réunions d'équipe, ni les temps de blocage.

### 4.2 Chiffrage par module

Le backlog initial représente **55,3 j/h** à produire à partir de J+3. L'équipe compte **4 personnes**, soit 32 j/h de capacité brute. Le périmètre a donc été ramené à **30,5 j/h**, non pas en supprimant des exigences du sujet, mais en réduisant la profondeur de chaque module jusqu'au niveau où l'exigence reste démontrable.

| Module | Contenu | Estimé initial | **Retenu (4 pers.)** | Écart |
|---|---|---:|---:|---:|
| M0 | Socle technique, dépôt, bases, CI, n8n, squelettes | 1,9 | *(réalisé J0–J1)* | — |
| M1 | Données publiques : CLI d'import/nettoyage, pré-remplissage Annuaire | 4,5 | **2,50** | −2,0 |
| M2 | Authentification, rôles, permissions, chiffrement | 5,5 | **3,25** | −2,25 |
| M3 | Profils animateur et structure | 3,5 | **1,75** | −1,75 |
| M4 | Créneaux, missions, tableau de bord | 8,0 | **3,50** | −4,5 |
| M5 | Conformité réglementaire : taux d'encadrement, honorabilité | 3,0 | **2,00** | −1,0 |
| M6 | Moteur de matching et scoring | 4,0 | **2,50** | −1,5 |
| M7 | Automatisations n8n (×2) | 2,0 | **1,50** | −0,5 |
| M8 | Frontend : design tokens, responsive, pages publiques | 4,0 | **2,50** | −1,5 |
| M9 | SEO on-page | 5,3 | **1,50** | −3,8 |
| M10 | Accessibilité RGAA + éco-conception RGESN | 2,5 | **1,50** | −1,0 |
| M11 | Tests unitaires, fonctionnels, couverture | 4,6 | **3,50** | −1,1 |
| M12 | Design produit Figma | 5,0 | **1,50** | −3,5 |
| L | Livrables documentaires restants (README, RGPD, exports, pitch, chiffrage réel) | 3,4 | **3,00** | −0,4 |
| | **Total à produire de J+3 à J+11** | **55,3** | **30,50** | **−24,8** |

### 4.3 Ce que « réduire la profondeur » signifie concrètement

Un chiffrage qu'on baisse sans rien changer au travail attendu n'est pas un arbitrage, c'est de l'optimisme. Chaque réduction ci-dessous correspond à une spécification revue à la baisse, module par module.

| Module | Ce qui est livré | Ce qui n'est pas fait |
|---|---|---|
| M1 | CLI à deux commandes (`import`, `clean`), pré-remplissage employeur par recherche sur le nom d'établissement | Interface d'administration, rafraîchissement incrémental, géocodage des adresses non normalisées |
| M2 | Inscription, connexion, JWT, hachage argon2, deux rôles, middleware de permission, chiffrement applicatif sur les champs sensibles identifiés | Refresh token rotatif, réinitialisation de mot de passe par email, OAuth tiers, audit log |
| M3 | Formulaires complets des deux profils, dépôt d'une pièce justificative d'honorabilité | Upload multiple, galerie de documents, complétion progressive du profil |
| M4 | CRUD sites et créneaux, cycle de mission `ouverte` / `pourvue` / `terminée`, dashboard en liste avec filtres | Agrégation multi-employeurs (V2), vue calendrier, historique et statistiques |
| M5 | Quatre configurations du décret 2016-1051, quotas R227-12, déclenchement automatique du besoin | Cas particuliers (accueils de plus de 5 h consécutives cumulés, dérogations préfectorales) |
| M6 | Trois verrous bloquants, formule de score figée (annexe B), historisation `match_runs` | Pondérations réglables, apprentissage des refus, suggestion de créneaux alternatifs |
| M7 | Deux scénarios n8n opérationnels et exportés | Reprise sur erreur, tableau de bord d'exécution |
| M8 | Design tokens intégrés, responsive sur trois points de rupture, fiche mission publique + accueil | États vides et états de chargement soignés, animations |
| M9 | Meta title/description dynamiques, un seul `h1`, URLs lisibles et slugs, `sitemap.xml`, `robots.txt` | JobPosting, listings par ville et département, canoniques, Open Graph, Core Web Vitals |
| M10 | Contrastes validés, navigation clavier, alternatives textuelles, structure sémantique ; compression des assets et mise en cache documentées | Audit RGAA exhaustif, mesure d'impact carbone chiffrée |
| M11 | Tests unitaires sur le calculateur d'encadrement et la formule de score, tests fonctionnels sur les 3 parcours critiques, rapport de couverture | Tests des chemins d'erreur, E2E navigateur, tests de charge |
| M12 | Wireframes des 4 écrans critiques, tokens et composants de base | Maquettage haute fidélité de tous les écrans, prototype cliquable complet |

**Point de vigilance.** Le chiffrement des données sensibles, la conformité RGAA et les pratiques RGESN étaient classés P2 et P3 dans le backlog ClickUp. Ce sont des exigences explicites du sujet : ils passent en P1 et ne figurent dans aucune liste de coupe.

---

## 5. Confrontation charge / capacité — élément de décision go/nogo

Équipe de **4 personnes**. Période de production : **J+3 à J+10**, soit 8 jours. J+11 est consacré à la répétition, à la démo et à la soutenance.

| Hypothèse de journée | Capacité brute | Capacité nette (−15 % aléas) | Charge retenue | Marge |
|---|---:|---:|---:|---:|
| 7 h par personne | 32,0 j/h | 27,2 j/h | 30,5 j/h | **−3,3** |
| 8 h par personne | 36,6 j/h | 31,1 j/h | 30,5 j/h | +0,6 |
| 9 h par personne | 41,1 j/h | 34,9 j/h | 30,5 j/h | +4,4 |

L'unité de chiffrage étant le jour-homme de 7 heures, la capacité réelle dépend de la durée de journée que l'équipe s'engage à tenir. C'est la variable à trancher explicitement au go/nogo, pas à découvrir à J+8.

> **Décision proposée : GO**, sur un périmètre ramené à 30,5 j/h, avec une convention de journée de 8 heures effectives. À 7 heures, le périmètre est en dépassement de 3,3 j/h et la réserve du chapitre 5.1 doit être déclenchée dès J+3.

La marge est nulle dans tous les cas. Une personne absente une journée, un blocage d'une demi-journée sur l'API France Travail, et le plan de repli devient obligatoire. Il est donc pré-arbitré ci-dessous plutôt qu'improvisé.

### 5.1 Réserve pré-arbitrée

Liste ordonnée, à déclencher dans cet ordre. Point de contrôle fixé à **J+6 en fin de journée** (et non J+7 : à 4 personnes, il faut réagir plus tôt). Si le retard cumulé dépasse 1,5 j/h, les trois premières lignes s'appliquent immédiatement.

| Ordre | Coupe | Gain | Impact |
|---|---|---:|---|
| 1 | Wireframes sur papier ou Excalidraw, pas de fichier Figma structuré | −0,75 | Aucun impact fonctionnel, rendu de conception moins présentable |
| 2 | Pré-remplissage employeur par liste déroulante statique d'établissements du département de démo | −0,50 | La donnée publique reste exploitée et nettoyée par le CLI |
| 3 | Dashboard en liste brute, sans filtres ni voyants agrégés | −0,50 | Le calcul de conformité reste visible sur la fiche créneau |
| 4 | Page d'accueil minimale, SEO démontré sur la seule fiche mission | −0,50 | Un seul gabarit indexable, exigence toujours couverte |
| 5 | Fiche de confirmation n8n en HTML statique au lieu d'une génération PDF | −0,50 | Exigence toujours couverte |
| 6 | Chiffrement applicatif limité aux pièces d'identité | −0,40 | Exigence toujours couverte, périmètre réduit |
| 7 | Profil animateur sans dépôt de pièce justificative | −0,40 | Honorabilité déclarée et datée, sans preuve stockée |
| 8 | Tests fonctionnels en chemin nominal uniquement sur les 3 parcours | −0,50 | Les 3 parcours exigés restent couverts |
| 9 | RGESN : deux pratiques appliquées et documentées, sans mesure d'impact | −0,25 | Exigence toujours couverte |
| | **Total mobilisable** | **−4,30** | Charge plancher : **26,2 j/h** |

Ne figurent dans aucune de ces lignes, et ne doivent être coupés sous aucun prétexte : le calculateur de taux d'encadrement, le verrou d'honorabilité, le moteur de matching, les tests unitaires et le rapport de couverture. Ce sont à la fois le cœur du pitch et les points de notation les plus lourds.

---

## 6. Planning J+3 → J+11

Rétroplanning calibré pour quatre membres travaillant en parallèle selon la répartition du chapitre 7, afin d'éviter un tunnel de fin de projet.

| Jour | Phase | Livrables et objectifs opérationnels |
|---|---|---|
| **J+3** | Socle et initialisation | Environnement partagé (`docker-compose` : Postgres, Mongo, Redis). Migrations relationnelles initiales et script de *seed*. DTO et contrats d'API figés entre front et back. Initialisation des projets React et Node en TypeScript. |
| **J+4** | Authentification et données | Authentification complète (rôles structure / animateur, JWT, hachage). CLI d'import et de nettoyage (Annuaire de l'éducation + API France Travail). Front : formulaires d'inscription et de connexion. |
| **J+5** | Créneaux et conformité | Back : CRUD sites et créneaux. Moteur de calcul des taux d'encadrement (décret 2016-1051) et des quotas BAFA. Front : vue planning et tableau de bord employeur avec statuts de conformité. |
| **J+6** | Moteur de matching | Chaîne de délibération : verrous bloquants puis score pondéré. Historisation des délibérations dans MongoDB (`match_runs`). Front : profils matchés côté employeur, propositions côté animateur. **Point de contrôle de la réserve (chapitre 5.1).** |
| **J+7** | Workflows n8n et cycle de mission | Worker *outbox* (Postgres → n8n). Deux scénarios n8n : notification d'urgence Mail et génération de la fiche de confirmation. Gestion des statuts `ouverte` / `pourvue` / `terminée`. |
| **J+8** | Tests critiques et sécurité | Tests unitaires (calculateur d'encadrement, formule de score). Tests fonctionnels sur les 3 parcours critiques (inscription, déclaration de créneau, matching). Rapport de couverture généré. Chiffrement applicatif des données sensibles. |
| **J+9** | Accessibilité, éco-conception, SEO | Audit et correctifs RGAA 4.1 (contrastes, navigation clavier, alternatives textuelles). Deux pratiques RGESN : compression des assets, mise en cache et réduction des requêtes. SEO socle sur les pages publiques. |
| **J+10** | Gel du code et répétition | Tests de bout en bout sur le parcours complet. Nettoyage du dépôt, README finalisé. Rédaction du chiffrage réel vs estimé. Construction du support de pitch. |
| **J+11** | Livraison et soutenance | Répétition générale avec tous les membres. Démonstration live. Soutenance orale. |

---

## 7. Répartition des modules

Quatre membres, un module n'a qu'un seul responsable. La charge est équilibrée à ±0,4 j/h près, ce qui ne laisse aucune place à une réaffectation tardive.

| Membre | Périmètre | Modules | Charge |
|---|---|---|---:|
| **A** — Back données et accès | CLI d'import, pré-remplissage, authentification, rôles, chiffrement, README et volet RGPD | M1, M2, L (technique) | 7,25 j/h |
| **B** — Back métier | Créneaux et missions, cycle de vie, calculateur d'encadrement, verrou d'honorabilité, moteur de matching | M4, M5, M6 | 8,00 j/h |
| **C** — Front et design | Wireframes, design tokens, écrans des deux profils, responsive, pages publiques et SEO | M3, M8, M9, M12 | 7,25 j/h |
| **D** — Qualité, nocode et conformité | Workflows n8n, RGAA et RGESN, harnais de tests et couverture, support de pitch et scénario de démo | M7, M10, M11, L (soutenance) | 8,00 j/h |
| | | **Total** | **30,50 j/h** |

**Précisions de fonctionnement**

- **D pilote les tests, il ne les écrit pas seul.** Chaque membre écrit les tests unitaires de ses propres modules ; D met en place le harnais, écrit les tests fonctionnels des 3 parcours et produit le rapport de couverture. Sans cette règle, D devient le goulot d'étranglement de J+8.
- **Les contrats d'API sont figés à J+3** entre A, B et C, avant tout développement d'écran. À 4 personnes, une renégociation d'interface en cours de route coûte plus cher que la fonctionnalité elle-même.
- **B est le chemin critique.** Ses trois modules portent le différenciateur et s'enchaînent : missions → calculateur → matching. Tout retard sur B se propage à la démo. Si B décroche, A bascule en renfort et le pré-remplissage (M1) part en réserve.
- **Revue croisée obligatoire** avant fusion, mais limitée à 20 minutes : à cet effectif, une revue longue coûte deux personnes.
- **Point quotidien de 15 minutes** sur les seuls blocages, pas sur l'avancement.
- **Tous les membres prennent la parole en soutenance.** D prépare le support, mais chacun présente ses modules et doit pouvoir répondre sur l'ensemble.

---

## 8. Architecture technique

| Couche | Choix | Justification |
|---|---|---|
| Frontend | React + TypeScript | Exigence du sujet, base MERN réutilisable |
| Rendu des pages publiques | Rendu serveur ou pré-rendu sur les fiches mission | Sans cela, les exigences SEO ne sont pas tenables |
| Backend | Node + TypeScript (NestJS ou Express + TS) | Exigence du sujet |
| Base relationnelle | PostgreSQL | Utilisateurs, structures, créneaux, missions, contrats : données fortement relationnelles et contraintes d'intégrité |
| Base non relationnelle | MongoDB | Historisation des délibérations de matching (`match_runs`) : documents hétérogènes, volumétrie en écriture, replay d'un score sans recalcul |
| Cache / file | Redis | Résultats de matching, file de l'*outbox* n8n |
| Automatisation | n8n + webhook Mail | Recommandation du sujet, orchestration simple, pas de dépendance à la délivrabilité email |
| CLI | Commander ou équivalent | Import et nettoyage des données publiques |
| Tests | Vitest ou Jest (unitaires), Supertest (fonctionnels) | Rapport de couverture livré |

**Traitement des données publiques.** Normalisation des libellés de poste, déduplication sur l'UAI et sur l'identifiant d'offre, conversion des formats de dates et de lieux, géocodage des communes. Le script est versionné et livré.

---

## 9. Couverture des exigences du sujet

| Exigence | Module | Statut |
|---|---|---|
| Justification du secteur et étude de marché | — | Livré (J0–J2) |
| Source de données publique consommable | M1 | Vérifiée : API France Travail (token obtenu, volume G1203 testé) + Annuaire de l'éducation |
| Proposition de valeur en une phrase | — | Figée au chapitre 2 |
| Roadmap + chiffrage estimé | — | Ce document |
| Deux types de comptes et permissions distinctes | M2 | Périmètre |
| Authentification sécurisée développée par nos soins | M2 | Périmètre |
| Chiffrement des données sensibles | M2 | Périmètre |
| Création de mission côté entreprise | M4 | Périmètre |
| Profil détaillé côté intérimaire | M3 | Périmètre |
| Algorithme de matching avec scoring | M6 | Périmètre, spécifié en annexe B |
| Tableau de bord des états de mission | M4 | Périmètre |
| Données publiques alimentant une fonctionnalité concrète | M1 | Pré-remplissage employeur + critère de distance |
| Nettoyage et reformatage des données | M1 | Script CLI livré |
| Deux automatisations nocode | M7 | Périmètre |
| RGAA 4.1, critères de base | M10 | Périmètre |
| Deux pratiques RGESN documentées | M10 | Périmètre |
| RGPD : base légale, conservation, mentions légales | L | Périmètre |
| Code du travail : règles de l'intérim et mentions du contrat de mission | M7 | La fiche de confirmation générée porte les mentions obligatoires |
| Achat responsable ou réemploi | — | Non pertinent sur ce secteur ; argumenté en soutenance plutôt que forcé |
| SEO on-page | M9 | Périmètre |
| Frontend TypeScript responsive | M8 | Périmètre |
| Backend Node TypeScript | — | Périmètre |
| Base relationnelle + non relationnelle | — | Postgres + MongoDB |
| Tests unitaires, fonctionnels, couverture | M11 | Périmètre |
| CLI dans la chaîne de traitement | M1 | Périmètre |

---

## 10. Risques et mesures

| Risque | Probabilité | Impact | Mesure |
|---|---|---|---|
| Charge supérieure à la capacité (marge nulle à 4 personnes) | Élevée | Élevé | Réserve pré-arbitrée du chapitre 5.1, point de contrôle à J+6 |
| Absence ou décrochage d'un membre | Moyenne | Élevé | Aucun module n'est connu d'une seule personne : revue croisée systématique, README technique tenu à jour par module. Le décrochage de B déclenche le renfort de A |
| Saturation du responsable qualité à J+8 | Moyenne | Moyen | Les tests unitaires sont écrits par les propriétaires de modules au fil de l'eau, pas concentrés en fin de projet |
| Quota ou instabilité de l'API France Travail | Moyenne | Moyen | Jeu de données mis en cache localement dès J+4 ; le POC reste démontrable hors ligne |
| Sous-estimation du moteur de matching | Moyenne | Élevé | Formule figée en annexe B avant développement ; verrous et scoring testés unitairement en priorité |
| Complexité du calcul d'encadrement (cas PEDT, durée d'accueil) | Moyenne | Moyen | Périmètre limité aux quatre configurations du décret ; les cas particuliers sont documentés comme non couverts |
| Absence de contenu à la démo | Moyenne | Élevé | Script de *seed* réaliste écrit dès J+3, pas la veille |
| Divergence front / back sur les contrats d'API | Moyenne | Moyen | DTO figés à J+3 avant tout écran |
| Démo live qui échoue en soutenance | Faible | Élevé | Scénario de démo répété à J+10, prototype Figma cliquable en secours |

---

## 11. Livrables et critères d'achèvement

| Livrable | Critère d'achèvement |
|---|---|
| Cahier des charges (J+2) | Ce document, présenté au go/nogo |
| Dossier d'étude de marché | Livré : secteur, concurrence, proposition de valeur, sources |
| Dépôt de code | Frontend + backend, arborescence propre, README d'installation et de lancement testé sur une machine vierge |
| Workflows nocode | Export JSON des deux scénarios n8n + capture d'exécution |
| Jeu de données publiques | Script CLI de nettoyage versionné + échantillon de sortie |
| Rapport de couverture | Généré et joint à la livraison |
| Chiffrage réel post-POC | Tableau estimé vs réel par module, avec analyse des écarts |
| Support de pitch | Problème, solution, démo live, avec prise de parole de tous les membres |
| Mentions légales et volet RGPD | Base légale, durée de conservation, mentions minimales |

---

## Annexe A — Calculateur de taux d'encadrement

**Taux d'encadrement (article R227-16 du CASF)**

#### Sans Projet Educatif de Territoire (PEDT)

| Duree de l'accueil | Moins de 6 ans | 6 ans et plus |
|---|---|---|
| Moins de 5 heures consecutives | 1 pour 10 | 1 pour 14 |
| Plus de 5 heures consecutives | 1 pour 8 | 1 pour 12 |

#### Avec Projet Educatif de Territoire (PEDT)

| Duree de l'accueil | Moins de 6 ans | 6 ans et plus |
|---|---|---|
| Moins de 5 heures consecutives | 1 pour 14 | 1 pour 18 |
| Plus de 5 heures consecutives | 1 pour 10 | 1 pour 14 |

Durant le temps de deplacement entre l'ecole et le local declare au PEDT, le taux d'encadrement est de 1 animateur pour 14 mineurs de 6 ans et plus et de 1 animateur pour 10 mineurs de moins de 6 ans.

Le POC couvre ces configurations ainsi que le cas specifique des deplacements lies au PEDT.

**Quotas de qualification (art. R227-12 du CASF)**

- Minimum **50 %** d'animateurs titulaires du BAFA ou d'un diplôme équivalent
- Maximum **30 %** de stagiaires en cours de formation
- Maximum **20 %** de personnes sans qualification

**Comportement attendu.** À chaque modification d'effectif sur un créneau, le calculateur renvoie l'effectif requis, l'effectif présent, l'écart, et l'état de conformité des quotas. Un écart négatif ouvre automatiquement un besoin de remplacement et déclenche le moteur de matching. C'est ce chaînage *calcul → déclenchement* qui constitue le différenciateur et il doit être visible en démo.

---

## Annexe B — Spécification du moteur de matching

Le moteur opère en deux temps stricts : filtres éliminatoires, puis score d'adéquation pour classer les candidats retenus.

### Étape 1 — Verrous bloquants

Un candidat est écarté si l'une des conditions suivantes échoue.

1. **Honorabilité non vérifiée** : statut différent de `VERIFIED` ou attestation expirée.
2. **Indisponibilité temporelle** : conflit d'agenda ou chevauchement avec un créneau déjà validé.
3. **Plafond de qualification (R227-12)** : si le créneau atteint déjà son quota maximal de personnes sans diplôme (20 %) ou de stagiaires (30 %), les profils ne disposant pas du BAFA complet sont filtrés.

### Étape 2 — Score pondéré sur 100 points

`Score = S_proximité + S_qualification + S_expérience + S_continuité`

**Proximité géographique — 40 points.** Critère prépondérant, en raison des horaires fractionnés et de l'urgence d'intervention.

| Distance | Points |
|---|---:|
| ≤ 5 km | 40 |
| 5 à 15 km | 25 |
| 15 à 30 km | 10 |
| > 30 km | 0, ou rejet si hors du rayon maximal défini par l'animateur |

**Adéquation de la qualification — 30 points.** Favorise la sécurisation des quotas réglementaires.

| Profil | Points |
|---|---:|
| Diplômé complet (BAFA, BAFD, BPJEPS, équivalent) | 30 |
| Stagiaire en cours de formation, si quota disponible | 20 |
| Non qualifié, si quota disponible | 10 |

**Expérience et tranche d'âge — 20 points.** Récompense la compatibilité avec le public accueilli.

| Profil | Points |
|---|---:|
| Expérience avérée sur la tranche d'âge du créneau (maternelle vs élémentaire) | 20 |
| Expérience générale en animation sans antériorité sur la tranche | 10 |
| Débutant | 5 |

**Continuité et connaissance de la structure — 10 points.** Prime à la fidélité et à la rapidité d'intégration.

| Profil | Points |
|---|---:|
| Au moins une mission déjà effectuée dans cette école ou structure | 10 |
| Nouveau sur la structure | 0 |

Chaque délibération est historisée dans MongoDB (`match_runs`) avec les candidats écartés et le motif du rejet : cela rend le résultat explicable en soutenance et rejouable sans recalcul.

---

## Annexe C — Suivi du chiffrage réel

Le sujet impose un chiffrage réel post-POC comparé à l'estimé. Le suivi est tenu au fil de l'eau, pas reconstitué à J+10.

- Le temps est saisi dans ClickUp à la tâche, quotidiennement en fin de journée.
- L'agrégation se fait selon les mêmes modules M0 à M12 que le chapitre 4, afin que la comparaison soit directe.
- Le tableau final porte quatre colonnes : estimé initial, retenu J+2, réel, écart en pourcentage.
- Les écarts supérieurs à 30 % font l'objet d'une ligne d'analyse écrite. C'est le contenu attendu du livrable, pas le chiffre brut.
