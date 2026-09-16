# Apik — Modèle physique de données

Document d'architecture des données. Accompagne `prisma/schema.prisma`,
`prisma/migrations/manual/01_constraints.sql` et
`src/persistence/mongo/schemas.ts`.

---

## 1. Principe directeur

Le modèle est construit autour d'une idée : **le créneau d'accueil est l'entité
centrale, pas la mission**. Un concurrent modélise une place de marché — offres
et candidats. Nous modélisons d'abord la réalité réglementaire d'un accueil
périscolaire, et la mission n'est qu'une conséquence calculée d'un déficit
d'encadrement sur un créneau.

Cette décision se voit dans le schéma : `CareSession` porte les effectifs
d'enfants, le barème applicable, le résultat du calcul de conformité et la
composition de l'équipe. `Mission` est en aval, reliée aux créneaux qu'elle
couvre par `MissionSlot`.

---

## 2. Répartition entre les deux bases

| | PostgreSQL | MongoDB |
|---|---|---|
| Nature | Données contractuelles et réglementaires | Données dérivées, importées ou journalisées |
| Intégrité | Clés étrangères, contraintes CHECK et EXCLUDE, transactions | Aucune garantie référentielle requise |
| Volumétrie | Modérée, croissance linéaire | Élevée, écriture massive, rétention glissante (TTL) |
| Perte acceptable | Non | Oui, tout est réimportable ou recalculable |
| Contenu | 25 tables : utilisateurs, structures, sites, créneaux, affectations, missions, candidatures, contrats, documents chiffrés, consentements | 5 collections : annuaire des écoles, cache d'offres France Travail, rapports d'import CLI, journaux de matching, journal d'audit |

La justification à donner en soutenance tient en une phrase : **si un document
Mongo disparaît, personne ne perd de droit ; si une ligne `contracts` disparaît,
un contrat de travail s'évapore.**

Le sujet demande une base non relationnelle « pour un usage complémentaire :
cache, logs de matching, recherche full-text ». Les cinq collections couvrent
exactement ces trois usages, et aucune n'est là pour faire nombre.

---

## 3. Schéma relationnel

```mermaid
erDiagram
    USER ||--o| ANIMATOR_PROFILE : "est"
    USER ||--o{ ORGANIZATION_MEMBER : "appartient a"
    USER ||--o{ REFRESH_TOKEN : "detient"
    USER ||--o{ STORED_DOCUMENT : "depose"
    USER ||--o{ CONSENT : "accorde"
    USER ||--o{ DATA_REQUEST : "formule"
    USER ||--o{ NOTIFICATION : "recoit"

    ORGANIZATION ||--o{ ORGANIZATION_MEMBER : "compte"
    ORGANIZATION ||--o{ SITE : "exploite"
    ORGANIZATION ||--o{ STAFF_MEMBER : "emploie"
    ORGANIZATION ||--o{ MISSION : "publie"
    ORGANIZATION ||--o{ CONTRACT : "signe"

    ORGANIZATION_MEMBER ||--o{ SITE_ACCESS : "limite a"
    SITE ||--o{ SITE_ACCESS : "accessible via"
    SITE ||--o{ CARE_SESSION : "planifie"
    SITE ||--o{ MISSION : "localise"

    CARE_SESSION ||--o{ ASSIGNMENT : "couverte par"
    CARE_SESSION ||--o{ MISSION_SLOT : "rattachee a"
    SUPERVISION_RULE }o..o{ CARE_SESSION : "bareme applique"

    STAFF_MEMBER ||--o{ ASSIGNMENT : "affecte"
    ANIMATOR_PROFILE ||--o{ ASSIGNMENT : "affecte"
    ANIMATOR_PROFILE ||--o{ QUALIFICATION : "detient"
    ANIMATOR_PROFILE ||--o{ AVAILABILITY_RULE : "declare"
    ANIMATOR_PROFILE ||--o{ AVAILABILITY_EXCEPTION : "declare"
    ANIMATOR_PROFILE ||--o| PAYMENT_DETAILS : "possede"
    ANIMATOR_PROFILE ||--o{ MISSION_APPLICATION : "candidate"
    ANIMATOR_PROFILE ||--o{ CONTRACT : "signe"

    MISSION ||--o{ MISSION_SLOT : "couvre"
    MISSION ||--o{ MISSION_APPLICATION : "recoit"
    MISSION ||--o{ ASSIGNMENT : "pourvoit"
    MISSION ||--o{ CONTRACT : "donne lieu a"

    STORED_DOCUMENT ||--o{ QUALIFICATION : "justifie"
    STORED_DOCUMENT ||--o{ CONTRACT : "materialise"
```

Deux tables restent hors graphe parce qu'elles n'ont volontairement aucune clé
étrangère : `MarketIndicator` (agrégats issus des données publiques, recalculés
par le CLI) et `WebhookOutbox` (file de sortie vers n8n).

---

## 4. Les sept décisions à savoir défendre

### 4.1 Le barème réglementaire est en base, pas dans le code

`SupervisionRule` contient le taux d'encadrement (1/10, 1/14, 1/18) indexé par
tranche d'âge, présence d'un PEDT et durée d'accueil, avec une référence légale
et une version datée. Trois bénéfices : le moteur devient testable sur des jeux
de règles fictifs, une évolution du décret ne demande pas de redéploiement, et
chaque calcul stocké sur `CareSession.rulesetVersion` reste auditable des mois
plus tard.

### 4.2 La conformité est dénormalisée sur le créneau

`CareSession` porte `requiredStaffTotal`, `assignedStaffTotal`, les trois
compteurs de composition et `complianceStatus`. On aurait pu tout recalculer à
la volée. On ne le fait pas parce que le tableau de bord affiche des centaines
de créneaux et que le cron de relance de 18 h interroge tous les créneaux du
lendemain non conformes : `@@index([date, complianceStatus])` transforme cette
requête en parcours d'index. Le recalcul est déclenché par tout changement
d'affectation ou d'effectif d'enfants.

### 4.3 L'instantané de qualification sur l'affectation

`Assignment.qualificationLevel` copie le niveau de la personne au moment où elle
est affectée. Si un animateur obtient son BAFA trois mois plus tard, la
composition d'équipe d'une séance passée ne doit pas changer rétroactivement :
en cas de contrôle, c'est la composition du jour J qui compte.

### 4.4 Les salariés permanents sont modélisés

`StaffMember` existe parce qu'un accueil n'est pas encadré uniquement par des
intérimaires. Sans cette table, le taux d'encadrement serait faux dès le premier
créneau réel. `Assignment` référence soit un `StaffMember`, soit un
`AnimatorProfile`, avec une contrainte CHECK d'exclusivité. C'est le point du
modèle qui montre qu'on a regardé le métier avant de coder.

### 4.5 L'anti-chevauchement est garanti par PostgreSQL

`Assignment` dénormalise `startsAt` et `endsAt` pour permettre une contrainte
`EXCLUDE USING gist`. Deux acceptations simultanées d'un même animateur sur deux
créneaux qui se recouvrent sont rejetées par la base, pas par une vérification
applicative sujette à condition de course. C'est la bonne réponse à la question
de jury « et si deux employeurs valident en même temps ? ».

### 4.6 Le chiffrement est applicatif, pas seulement au repos

`PaymentDetails` et `StoredDocument` stockent un ciphertext, un IV, un tag
d'authentification GCM et une version de clé. Le chiffrement au repos du disque
ne protège pas d'un accès en lecture à la base ; le chiffrement applicatif, si.
`ibanLast4` est en clair pour permettre l'affichage sans déchiffrer, et
`keyVersion` rend une rotation de clé possible sans migration destructive.

### 4.7 L'outbox transactionnel vers n8n

`WebhookOutbox` reçoit l'événement dans la même transaction que le changement
métier. Un worker le livre ensuite avec retry et backoff. Sans cela, un webhook
qui échoue fait perdre silencieusement une notification de match ou une
génération de contrat — le genre de panne qui ne se voit qu'en démonstration.

---

## 5. Ce que le modèle permet au moteur de matching

L'éligibilité se lit dans le schéma sans requête exotique :

| Verrou | Source de la décision |
|---|---|
| Honorabilité | `AnimatorProfile.honorabilityStatus = VERIFIED` et `honorabilityExpiresAt` non dépassée |
| Disponibilité | `AvailabilityRule` sur le couple (jour, bloc), corrigée par `AvailabilityException` |
| Conflit d'horaire | absence d'`Assignment` actif chevauchant, garantie par la contrainte d'exclusion |
| Quota R227-12 | compteurs `qualifiedCount` / `traineeCount` / `unqualifiedCount` du créneau |
| Distance | pré-filtre bounding box sur `latitude`/`longitude`, puis Haversine sur le reliquat |

Le quota est le seul verrou qui ne se calcule pas candidat par candidat :
recruter un non-qualifié est possible ou non selon la composition déjà en place.
C'est ce qui fait que le matching n'est pas un simple `ORDER BY score DESC`, et
c'est le point technique à mettre en avant.

Le score pondéré ne s'applique qu'aux candidats éligibles, et l'intégralité de
la délibération — y compris les candidats écartés et le code du verrou qui les a
écartés — part dans `match_runs`. L'employeur peut donc obtenir une explication
de l'absence d'un profil qu'il attendait.

---

## 6. Où entrent les données publiques

| Source | Stockage | Fonctionnalité alimentée |
|---|---|---|
| Annuaire de l'éducation | `school_directory` (Mongo, index texte + 2dsphere) | Autocomplétion et géolocalisation à la création d'un site |
| API France Travail, ROME G1203 | `job_offers` (Mongo, brut + normalisé) | Base de calcul des indicateurs |
| Agrégats calculés par le CLI | `MarketIndicator` (PostgreSQL) | Suggestion de rémunération à la création de mission, carte de tension |
| DARES | `MarketIndicator` | Indicateur de tension affiché |

Le brut et le normalisé cohabitent volontairement dans `job_offers` : cela
permet de rejouer le nettoyage sans réinterroger l'API, et de montrer l'avant
et l'après en soutenance. `cleaningFlags` nomme chaque correction appliquée, ce
qui alimente directement le livrable « script de nettoyage ».

---

## 7. Mise en place

```bash
# 1. Variables d'environnement
DATABASE_URL="postgresql://apik:***@localhost:5432/apik"
MONGO_URL="mongodb://localhost:27017/apik"
ENCRYPTION_KEY_V1="<32 octets en base64, hors dépôt>"

# 2. Migration relationnelle
npx prisma migrate dev --name init
psql "$DATABASE_URL" -f prisma/migrations/manual/01_constraints.sql

# 3. Seed du barème réglementaire et des jeux de démonstration
npx prisma db seed

# 4. Import des données publiques
apik import:schools --source annuaire-education
apik import:offers --rome G1203 --departments 69,75,33 --since 60d
apik compute:indicators --rome G1203 --level COMMUNE
```

Les extensions `citext`, `btree_gist` et `pg_trgm` sont créées par le script de
contraintes : le rôle PostgreSQL utilisé pour les migrations doit pouvoir
exécuter `CREATE EXTENSION`.

---

## 8. Limites assumées du POC

- **Pas de PostGIS.** Latitude et longitude sont stockées en `Decimal(9,6)` avec
  un pré-filtre par bounding box puis un calcul Haversine applicatif. Suffisant
  jusqu'à quelques dizaines de milliers de profils ; PostGIS serait le bon choix
  au-delà.
- **Honorabilité déclarative.** Le fichier des interdictions d'exercer n'est
  consultable que par un organisateur déclaré, via TAM. Le modèle enregistre la
  vérification (auteur, date, expiration) et l'audite, mais ne peut pas
  l'automatiser. La limite est structurelle, pas technique, et il faut la
  présenter comme telle.
- **Pas de moteur de paie.** Les contrats portent les mentions obligatoires et
  un taux horaire ; la facturation, les coefficients et les bulletins sont hors
  périmètre.
- **Récurrence des créneaux matérialisée.** Chaque occurrence donne une ligne
  `CareSession` plutôt qu'une règle de récurrence. Plus volumineux, mais la
  conformité se calcule sur une date réelle avec un effectif d'enfants réel.
