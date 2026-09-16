-- =============================================================================
-- Apik — Contraintes d'intégrité non exprimables dans le DSL Prisma
--
-- À exécuter après `prisma migrate dev`, ou à coller dans le fichier de
-- migration généré pour qu'elles soient versionnées avec le reste du schéma.
-- Chacune déplace une règle métier du code applicatif vers la base : c'est un
-- argument direct en soutenance sur la question « et si deux requêtes arrivent
-- en même temps ? ».
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS citext;      -- emails insensibles à la casse
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- contrainte d'exclusion mixte
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- recherche approximative de libellés

-- -----------------------------------------------------------------------------
-- 1. Une affectation vise soit un salarié permanent, soit un animateur Apik.
--    Jamais les deux, jamais aucun des deux.
-- -----------------------------------------------------------------------------
ALTER TABLE assignments
  ADD CONSTRAINT assignment_single_subject CHECK (
    ("staffMemberId" IS NOT NULL AND "animatorProfileId" IS NULL)
    OR
    ("staffMemberId" IS NULL AND "animatorProfileId" IS NOT NULL)
  );

-- Cohérence entre l'origine déclarée et la colonne réellement renseignée
ALTER TABLE assignments
  ADD CONSTRAINT assignment_source_consistency CHECK (
    (source = 'INTERNAL_STAFF' AND "staffMemberId" IS NOT NULL)
    OR
    (source = 'APIK_MISSION' AND "animatorProfileId" IS NOT NULL)
  );

-- -----------------------------------------------------------------------------
-- 2. Anti-chevauchement : un animateur ne peut pas être affecté à deux créneaux
--    qui se recouvrent. Verrou garanti par la base, y compris en concurrence.
--    Les affectations annulées ou marquées absentes sont exclues du contrôle.
-- -----------------------------------------------------------------------------
ALTER TABLE assignments
  ADD CONSTRAINT assignment_no_overlap EXCLUDE USING gist (
    "animatorProfileId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  ) WHERE (
    "animatorProfileId" IS NOT NULL
    AND status IN ('PLANNED', 'CONFIRMED', 'COMPLETED')
  );

ALTER TABLE assignments
  ADD CONSTRAINT assignment_time_order CHECK ("startsAt" < "endsAt");

-- -----------------------------------------------------------------------------
-- 3. Créneaux d'accueil : bornes horaires et effectifs cohérents
-- -----------------------------------------------------------------------------
ALTER TABLE care_sessions
  ADD CONSTRAINT session_time_order CHECK (
    "startMinutes" >= 0 AND "endMinutes" <= 1440 AND "startMinutes" < "endMinutes"
  );

ALTER TABLE care_sessions
  ADD CONSTRAINT session_children_positive CHECK (
    "childrenUnder6" >= 0 AND "children6AndOver" >= 0
  );

-- Les compteurs de composition d'équipe doivent sommer à l'effectif affecté
ALTER TABLE care_sessions
  ADD CONSTRAINT session_headcount_consistency CHECK (
    "qualifiedCount" + "traineeCount" + "unqualifiedCount" = "assignedStaffTotal"
  );

-- -----------------------------------------------------------------------------
-- 4. Disponibilités
-- -----------------------------------------------------------------------------
ALTER TABLE availability_rules
  ADD CONSTRAINT availability_weekday_range CHECK (weekday BETWEEN 1 AND 7);

ALTER TABLE availability_rules
  ADD CONSTRAINT availability_time_order CHECK ("startMinutes" < "endMinutes");

-- -----------------------------------------------------------------------------
-- 5. Missions
-- -----------------------------------------------------------------------------
ALTER TABLE missions
  ADD CONSTRAINT mission_date_order CHECK ("startDate" <= "endDate");

ALTER TABLE missions
  ADD CONSTRAINT mission_positions CHECK (
    "requiredPositions" > 0 AND "filledPositions" BETWEEN 0 AND "requiredPositions"
  );

ALTER TABLE missions
  ADD CONSTRAINT mission_rate_positive CHECK ("hourlyRateCents" > 0);

-- -----------------------------------------------------------------------------
-- 6. Contrats de mission — garde-fous issus du Code du travail
--    Durée maximale de droit commun d'une mission d'intérim : 18 mois
--    (renouvellements compris, art. L1251-12 du Code du travail).
-- -----------------------------------------------------------------------------
ALTER TABLE contracts
  ADD CONSTRAINT contract_date_order CHECK ("startDate" <= "endDate");

ALTER TABLE contracts
  ADD CONSTRAINT contract_max_duration CHECK (
    "endDate" <= "startDate" + INTERVAL '18 months'
  );

ALTER TABLE contracts
  ADD CONSTRAINT contract_trial_period CHECK ("trialPeriodDays" BETWEEN 0 AND 5);

-- Un seul contrat vivant par couple mission / animateur
CREATE UNIQUE INDEX contract_one_active_per_pair
  ON contracts ("missionId", "animatorProfileId")
  WHERE status NOT IN ('TERMINATED', 'DRAFT');

-- -----------------------------------------------------------------------------
-- 7. Index de recherche approximative sur les noms de structures et de sites
--    (autocomplétion tolérante aux fautes de frappe)
-- -----------------------------------------------------------------------------
CREATE INDEX organizations_name_trgm ON organizations USING gin (name gin_trgm_ops);
CREATE INDEX sites_name_trgm ON sites USING gin (name gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- 8. Purge RGPD : documents dont la durée de conservation est dépassée.
--    À déclencher par le CLI ou un cron n8n quotidien.
-- -----------------------------------------------------------------------------
CREATE INDEX stored_documents_due_purge
  ON stored_documents ("retentionUntil")
  WHERE "deletedAt" IS NULL;
