/**
 * Apik — Modèle physique de données (MongoDB)
 *
 * Cinq collections, chacune avec une justification qui tient en une phrase :
 *  - school_directory : référentiel public volumineux, interrogé en plein texte
 *  - job_offers       : cache d'une API externe au schéma instable
 *  - import_batches   : rapports d'exécution du CLI, structure variable
 *  - match_runs       : journal d'écriture massive, jamais joint, purgeable
 *  - audit_logs       : append-only, volumétrie élevée, rétention glissante
 *
 * Aucune de ces collections ne porte de donnée dont l'intégrité référentielle
 * doit être garantie : tout ce qui est contractuel reste dans PostgreSQL.
 */

import { Schema, model, type InferSchemaType } from 'mongoose';

/* ==========================================================================
 * 1. Référentiel des établissements scolaires
 * Source : Annuaire de l'éducation (data.gouv.fr), ~65 000 documents.
 * Usage produit : autocomplétion à l'inscription employeur, pré-remplissage
 * de l'adresse et des coordonnées d'un site d'accueil.
 * ========================================================================== */

const SchoolSchema = new Schema(
  {
    uai: { type: String, required: true, unique: true }, // identifiant national
    name: { type: String, required: true },
    type: String, // "Ecole maternelle", "Ecole élémentaire", "Ecole primaire"
    status: String, // "Public" | "Privé"
    address: {
      line: String,
      postalCode: { type: String, index: true },
      city: String,
      inseeCode: { type: String, index: true },
      department: String,
      region: String,
    },
    location: {
      // GeoJSON — permet $near sans calcul applicatif
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    studentCount: Number,
    hasCanteen: Boolean,
    hasChildcare: Boolean, // restauration / garderie déclarées dans l'annuaire
    sourceUpdatedAt: Date,
    importedAt: { type: Date, default: Date.now },
  },
  { collection: 'school_directory', versionKey: false },
);

SchoolSchema.index({ location: '2dsphere' });
SchoolSchema.index(
  { name: 'text', 'address.city': 'text' },
  { default_language: 'french', weights: { name: 10, 'address.city': 3 } },
);

export type School = InferSchemaType<typeof SchoolSchema>;
export const SchoolModel = model('School', SchoolSchema);

/* ==========================================================================
 * 2. Offres d'emploi France Travail (ROME G1203)
 * Le document conserve la charge brute et sa version normalisée : on peut
 * rejouer le nettoyage sans réinterroger l'API, et démontrer le avant/après
 * en soutenance.
 * ========================================================================== */

const JobOfferSchema = new Schema(
  {
    sourceId: { type: String, required: true, unique: true }, // id France Travail
    source: { type: String, default: 'france-travail' },
    importBatchId: { type: String, required: true, index: true },
    contentHash: { type: String, required: true, index: true }, // dédoublonnage

    raw: { type: Schema.Types.Mixed, required: true }, // charge API intacte

    normalized: {
      title: String,
      titleNormalized: { type: String, index: true }, // libellé canonique
      romeCode: { type: String, index: true },
      contractType: String, // MIS, CDD, CDI…
      isTemporary: Boolean,
      commune: String,
      inseeCode: { type: String, index: true },
      postalCode: String,
      department: String,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number],
      },
      hourlyRateCents: Number, // reconstruit depuis un libellé de salaire libre
      rateConfidence: { type: String, enum: ['exact', 'derived', 'unknown'] },
      weeklyHours: Number,
      requiredQualification: String,
      publishedAt: Date,
      expiresAt: Date,
    },

    // Traçabilité du nettoyage : chaque anomalie corrigée est nommée
    cleaningFlags: [String], // ex. "salary_parsed_from_text", "city_disambiguated"
    isRejected: { type: Boolean, default: false },
    rejectionReason: String,

    fetchedAt: { type: Date, default: Date.now },
  },
  { collection: 'job_offers', versionKey: false },
);

JobOfferSchema.index({ 'normalized.location': '2dsphere' });
JobOfferSchema.index({ 'normalized.romeCode': 1, 'normalized.publishedAt': -1 });
JobOfferSchema.index(
  { 'normalized.title': 'text' },
  { default_language: 'french' },
);
// Purge automatique du cache après 90 jours (éco-conception : on ne conserve
// pas indéfiniment une donnée réimportable)
JobOfferSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export type JobOffer = InferSchemaType<typeof JobOfferSchema>;
export const JobOfferModel = model('JobOffer', JobOfferSchema);

/* ==========================================================================
 * 3. Rapports d'import du CLI
 * Livrable « jeu de données publiques » : un document par exécution.
 * ========================================================================== */

const ImportBatchSchema = new Schema(
  {
    batchId: { type: String, required: true, unique: true },
    source: { type: String, required: true }, // france-travail | annuaire-education | dares
    command: String, // ligne de commande complète rejouée
    parameters: Schema.Types.Mixed, // { rome, departments, since… }
    cliVersion: String,

    counts: {
      fetched: { type: Number, default: 0 },
      inserted: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
      duplicates: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
    },
    cleaningSummary: Schema.Types.Mixed, // { salary_parsed_from_text: 128, … }
    errors: [{ stage: String, message: String, occurrences: Number }],

    status: {
      type: String,
      enum: ['running', 'succeeded', 'partial', 'failed'],
      default: 'running',
    },
    startedAt: { type: Date, default: Date.now },
    finishedAt: Date,
    durationMs: Number,
  },
  { collection: 'import_batches', versionKey: false },
);

ImportBatchSchema.index({ source: 1, startedAt: -1 });

export type ImportBatch = InferSchemaType<typeof ImportBatchSchema>;
export const ImportBatchModel = model('ImportBatch', ImportBatchSchema);

/* ==========================================================================
 * 4. Journal des exécutions du moteur de matching
 * Écriture massive, schéma évolutif (les critères changent avec la version de
 * l'algorithme), jamais joint à une autre table. PostgreSQL ne garde que le
 * candidat retenu et son score ; ici on garde toute la délibération.
 * C'est cette collection qui justifie le choix d'une base non relationnelle.
 * ========================================================================== */

const MatchRunSchema = new Schema(
  {
    runId: { type: String, required: true, unique: true },
    missionId: { type: String, required: true, index: true }, // UUID PostgreSQL
    siteId: String,
    trigger: {
      type: String,
      enum: ['manual', 'compliance_engine', 'reschedule', 'radius_escalation'],
      required: true,
    },
    algorithmVersion: { type: String, required: true },
    weights: Schema.Types.Mixed, // instantané de la pondération appliquée

    // Contexte de la contrainte de composition d'équipe (CASF art. R227-12)
    teamComposition: {
      before: { qualified: Number, trainee: Number, unqualified: Number },
      requiredTotal: Number,
      allowedLevels: [String], // niveaux encore recevables sans casser le quota
    },

    candidatesEvaluated: { type: Number, default: 0 },
    candidatesEligible: { type: Number, default: 0 },

    candidates: [
      {
        _id: false,
        animatorProfileId: String,
        isEligible: Boolean,
        // Verrous bloquants : honorabilité, disponibilité, conflit d'horaire,
        // quota de composition. Renseignés même pour les candidats écartés,
        // c'est ce qui rend le refus explicable à l'employeur.
        blockers: [
          {
            _id: false,
            code: String, // HONORABILITY_NOT_VERIFIED, SLOT_CONFLICT, QUOTA_FULL…
            detail: String,
          },
        ],
        scoreTotal: Number,
        breakdown: {
          proximity: { value: Number, weight: Number, raw: Number }, // raw = km
          availability: { value: Number, weight: Number },
          experience: { value: Number, weight: Number },
          siteFamiliarity: { value: Number, weight: Number },
          hoursConsolidation: { value: Number, weight: Number },
        },
        rank: Number,
        wasNotified: Boolean,
      },
    ],

    selectedAnimatorProfileId: String,
    durationMs: Number,
    executedAt: { type: Date, default: Date.now, index: true },
  },
  { collection: 'match_runs', versionKey: false },
);

MatchRunSchema.index({ missionId: 1, executedAt: -1 });
MatchRunSchema.index({ 'candidates.animatorProfileId': 1 });
// Rétention 12 mois : au-delà, seul le résultat conservé en PostgreSQL subsiste
MatchRunSchema.index({ executedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export type MatchRun = InferSchemaType<typeof MatchRunSchema>;
export const MatchRunModel = model('MatchRun', MatchRunSchema);

/* ==========================================================================
 * 5. Journal d'audit
 * Traçabilité RGPD des accès et actions sur données sensibles : consultation
 * d'un document d'identité, vérification d'honorabilité, génération de contrat,
 * export ou suppression de compte.
 * ========================================================================== */

const AuditLogSchema = new Schema(
  {
    actorUserId: { type: String, index: true },
    actorRole: String,
    action: { type: String, required: true, index: true }, // document.read, honorability.verify…
    resourceType: String,
    resourceId: { type: String, index: true },
    targetUserId: { type: String, index: true }, // personne concernée par la donnée
    outcome: { type: String, enum: ['success', 'denied', 'error'] },
    legalBasis: String, // base légale invoquée pour l'accès
    metadata: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    occurredAt: { type: Date, default: Date.now, index: true },
  },
  { collection: 'audit_logs', versionKey: false },
);

AuditLogSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 1095 }); // 3 ans

export type AuditLog = InferSchemaType<typeof AuditLogSchema>;
export const AuditLogModel = model('AuditLog', AuditLogSchema);
