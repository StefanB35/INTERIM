/**
 * Apik — Modèle physique de données (MongoDB)[cite: 5]
 *
 * Cinq collections, chacune avec une justification qui tient en une phrase :[cite: 5]
 *  - school_directory : référentiel public volumineux, interrogé en plein texte[cite: 5]
 *  - job_offers       : cache d'une API externe au schéma instable[cite: 5]
 *  - import_batches   : rapports d'exécution du CLI, structure variable[cite: 5]
 *  - match_runs       : journal d'écriture massive, jamais joint, purgeable[cite: 5]
 *  - audit_logs       : append-only, volumétrie élevée, rétention glissante[cite: 5]
 *
 * Aucune de ces collections ne porte de donnée dont l'intégrité référentielle[cite: 5]
 * doit être garantie : tout ce qui est contractuel reste dans PostgreSQL.[cite: 5]
 */

import { Schema, model, type InferSchemaType } from "mongoose"; //[cite: 5]

/* ==========================================================================
 * 1. Référentiel des établissements scolaires[cite: 5]
 * Source : Annuaire de l'éducation (data.gouv.fr), ~65 000 documents.[cite: 5]
 * Usage produit : autocomplétion à l'inscription employeur, pré-remplissage[cite: 5]
 * de l'adresse et des coordonnées d'un site d'accueil.[cite: 5]
 * ========================================================================== */

const SchoolSchema = new Schema( //[cite: 5]
  {
    uai: { type: String, required: true, unique: true }, // identifiant national[cite: 5]
    name: { type: String, required: true }, //[cite: 5]
    type: String, // "Ecole maternelle", "Ecole élémentaire", "Ecole primaire"[cite: 5]
    status: String, // "Public" | "Privé"[cite: 5]
    address: {
      //[cite: 5]
      line: String, //[cite: 5]
      postalCode: { type: String, index: true }, //[cite: 5]
      city: String, //[cite: 5]
      inseeCode: { type: String, index: true }, //[cite: 5]
      department: String, //[cite: 5]
      region: String, //[cite: 5]
    },
    location: {
      //[cite: 5]
      // GeoJSON — permet $near sans calcul applicatif[cite: 5]
      type: { type: String, enum: ["Point"], default: "Point" }, //[cite: 5]
      coordinates: { type: [Number], required: true }, // [longitude, latitude][cite: 5]
    },
    studentCount: Number, //[cite: 5]
    hasCanteen: Boolean, //[cite: 5]
    hasChildcare: Boolean, // restauration / garderie déclarées dans l'annuaire[cite: 5]
    sourceUpdatedAt: Date, //[cite: 5]
    importedAt: { type: Date, default: Date.now }, //[cite: 5]
  },
  { collection: "school_directory", versionKey: false }, //[cite: 5]
);

SchoolSchema.index({ location: "2dsphere" }); //[cite: 5]
SchoolSchema.index(
  //[cite: 5]
  { name: "text", "address.city": "text" }, //[cite: 5]
  { default_language: "french", weights: { name: 10, "address.city": 3 } }, //[cite: 5]
);

export type School = InferSchemaType<typeof SchoolSchema>; //[cite: 5]
export const SchoolModel = model("School", SchoolSchema); //[cite: 5]

/* ==========================================================================
 * 2. Offres d'emploi France Travail (ROME G1203)[cite: 5]
 * Le document conserve la charge brute et sa version normalisée : on peut[cite: 5]
 * rejouer le nettoyage sans réinterroger l'API, et démontrer le avant/après[cite: 5]
 * en soutenance.[cite: 5]
 * ========================================================================== */

const JobOfferSchema = new Schema( //[cite: 5]
  {
    sourceId: { type: String, required: true, unique: true }, // id France Travail[cite: 5]
    source: { type: String, default: "france-travail" }, //[cite: 5]
    importBatchId: { type: String, required: true, index: true }, //[cite: 5]
    contentHash: { type: String, required: true, index: true }, // dédoublonnage[cite: 5]

    raw: { type: Schema.Types.Mixed, required: true }, // charge API intacte[cite: 5]

    normalized: {
      //[cite: 5]
      title: String, //[cite: 5]
      titleNormalized: { type: String, index: true }, // libellé canonique[cite: 5]
      romeCode: { type: String, index: true }, //[cite: 5]
      contractType: String, // MIS, CDD, CDI…[cite: 5]
      isTemporary: Boolean, //[cite: 5]
      commune: String, //[cite: 5]
      inseeCode: { type: String, index: true }, //[cite: 5]
      postalCode: String, //[cite: 5]
      department: String, //[cite: 5]
      location: {
        //[cite: 5]
        type: { type: String, enum: ["Point"], default: "Point" }, //[cite: 5]
        coordinates: [Number], //[cite: 5]
      },
      hourlyRateCents: Number, // reconstruit depuis un libellé de salaire libre[cite: 5]
      rateConfidence: { type: String, enum: ["exact", "derived", "unknown"] }, //[cite: 5]
      weeklyHours: Number, //[cite: 5]
      requiredQualification: String, //[cite: 5]
      publishedAt: Date, //[cite: 5]
      expiresAt: Date, //[cite: 5]
    },

    // Traçabilité du nettoyage : chaque anomalie corrigée est nommée[cite: 5]
    cleaningFlags: [String], // ex. "salary_parsed_from_text", "city_disambiguated"[cite: 5]
    isRejected: { type: Boolean, default: false }, //[cite: 5]
    rejectionReason: String, //[cite: 5]

    fetchedAt: { type: Date, default: Date.now }, //[cite: 5]
  },
  { collection: "job_offers", versionKey: false }, //[cite: 5]
);

JobOfferSchema.index({ "normalized.location": "2dsphere" }); //[cite: 5]
JobOfferSchema.index({
  "normalized.romeCode": 1,
  "normalized.publishedAt": -1,
}); //[cite: 5]
JobOfferSchema.index(
  //[cite: 5]
  { "normalized.title": "text" }, //[cite: 5]
  { default_language: "french" }, //[cite: 5]
);
// Purge automatique du cache après 90 jours (éco-conception : on ne conserve[cite: 5]
// pas indéfiniment une donnée réimportable)[cite: 5]
JobOfferSchema.index(
  { fetchedAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 },
); //[cite: 5]

export type JobOffer = InferSchemaType<typeof JobOfferSchema>; //[cite: 5]
export const JobOfferModel = model("JobOffer", JobOfferSchema); //[cite: 5]

/* ==========================================================================
 * 3. Rapports d'import du CLI[cite: 5]
 * Livrable « jeu de données publiques » : un document par exécution.[cite: 5]
 * ========================================================================== */

const ImportBatchSchema = new Schema( //[cite: 5]
  {
    batchId: { type: String, required: true, unique: true }, //[cite: 5]
    source: { type: String, required: true }, // france-travail | annuaire-education | dares[cite: 5]
    command: String, // ligne de commande complète rejouée[cite: 5]
    parameters: Schema.Types.Mixed, // { rome, departments, since… }[cite: 5]
    cliVersion: String, //[cite: 5]

    counts: {
      //[cite: 5]
      fetched: { type: Number, default: 0 }, //[cite: 5]
      inserted: { type: Number, default: 0 }, //[cite: 5]
      updated: { type: Number, default: 0 }, //[cite: 5]
      duplicates: { type: Number, default: 0 }, //[cite: 5]
      rejected: { type: Number, default: 0 }, //[cite: 5]
    },
    cleaningSummary: Schema.Types.Mixed, // { salary_parsed_from_text: 128, … }[cite: 5]
    errors: [{ stage: String, message: String, occurrences: Number }], //[cite: 5]

    status: {
      //[cite: 5]
      type: String, //[cite: 5]
      enum: ["running", "succeeded", "partial", "failed"], //[cite: 5]
      default: "running", //[cite: 5]
    },
    startedAt: { type: Date, default: Date.now }, //[cite: 5]
    finishedAt: Date, //[cite: 5]
    durationMs: Number, //[cite: 5]
  },
  { collection: "import_batches", versionKey: false }, //[cite: 5]
);

ImportBatchSchema.index({ source: 1, startedAt: -1 }); //[cite: 5]

export type ImportBatch = InferSchemaType<typeof ImportBatchSchema>; //[cite: 5]
export const ImportBatchModel = model("ImportBatch", ImportBatchSchema); //[cite: 5]

/* ==========================================================================
 * 4. Journal des exécutions du moteur de matching[cite: 5]
 * Écriture massive, schéma évolutif (les critères changent avec la version de[cite: 5]
 * l'algorithme), jamais joint à une autre table. PostgreSQL ne garde que le[cite: 5]
 * candidat retenu et son score ; ici on garde toute la délibération.[cite: 5]
 * C'est cette collection qui justifie le choix d'une base non relationnelle.[cite: 5]
 * ========================================================================== */

const MatchRunSchema = new Schema( //[cite: 5]
  {
    runId: { type: String, required: true, unique: true }, //[cite: 5]
    missionId: { type: String, required: true, index: true }, // UUID PostgreSQL[cite: 5]
    siteId: String, //[cite: 5]
    trigger: {
      //[cite: 5]
      type: String, //[cite: 5]
      enum: ["manual", "compliance_engine", "reschedule", "radius_escalation"], //[cite: 5]
      required: true, //[cite: 5]
    },
    algorithmVersion: { type: String, required: true }, //[cite: 5]
    weights: Schema.Types.Mixed, // instantané de la pondération appliquée[cite: 5]

    // Contexte de la contrainte de composition d'équipe (CASF art. R227-12)[cite: 5]
    teamComposition: {
      //[cite: 5]
      before: { qualified: Number, trainee: Number, unqualified: Number }, //[cite: 5]
      requiredTotal: Number, //[cite: 5]
      allowedLevels: [String], // niveaux encore recevables sans casser le quota[cite: 5]
    },

    candidatesEvaluated: { type: Number, default: 0 }, //[cite: 5]
    candidatesEligible: { type: Number, default: 0 }, //[cite: 5]

    candidates: [
      //[cite: 5]
      {
        _id: false, //[cite: 5]
        animatorProfileId: String, //[cite: 5]
        isEligible: Boolean, //[cite: 5]
        // Verrous bloquants : honorabilité, disponibilité, conflit d'horaire,[cite: 5]
        // quota de composition. Renseignés même pour les candidats écartés,[cite: 5]
        // c'est ce qui rend le refus explicable à l'employeur.[cite: 5]
        blockers: [
          //[cite: 5]
          {
            _id: false, //[cite: 5]
            code: String, // HONORABILITY_NOT_VERIFIED, SLOT_CONFLICT, QUOTA_FULL…[cite: 5]
            detail: String, //[cite: 5]
          },
        ],
        scoreTotal: Number, //[cite: 5]
        breakdown: {
          //[cite: 5]
          proximity: { value: Number, weight: Number, raw: Number }, // raw = km[cite: 5]
          availability: { value: Number, weight: Number }, //[cite: 5]
          experience: { value: Number, weight: Number }, //[cite: 5]
          siteFamiliarity: { value: Number, weight: Number }, //[cite: 5]
          hoursConsolidation: { value: Number, weight: Number }, //[cite: 5]
        },
        rank: Number, //[cite: 5]
        wasNotified: Boolean, //[cite: 5]
      },
    ],

    selectedAnimatorProfileId: String, //[cite: 5]
    durationMs: Number, //[cite: 5]
    executedAt: { type: Date, default: Date.now, index: true }, //[cite: 5]
  },
  { collection: "match_runs", versionKey: false }, //[cite: 5]
);

MatchRunSchema.index({ missionId: 1, executedAt: -1 }); //[cite: 5]
MatchRunSchema.index({ "candidates.animatorProfileId": 1 }); //[cite: 5]
// Rétention 12 mois : au-delà, seul le résultat conservé en PostgreSQL subsiste[cite: 5]
MatchRunSchema.index(
  { executedAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 },
); //[cite: 5]

export type MatchRun = InferSchemaType<typeof MatchRunSchema>; //[cite: 5]
export const MatchRunModel = model("MatchRun", MatchRunSchema); //[cite: 5]

/* ==========================================================================
 * 5. Journal d'audit[cite: 5]
 * Traçabilité RGPD des accès et actions sur données sensibles : consultation[cite: 5]
 * d'un document d'identité, vérification d'honorabilité, génération de contrat,[cite: 5]
 * export ou suppression de compte.[cite: 5]
 * ========================================================================== */

const AuditLogSchema = new Schema( //[cite: 5]
  {
    actorUserId: { type: String, index: true }, //[cite: 5]
    actorRole: String, //[cite: 5]
    action: { type: String, required: true, index: true }, // document.read, honorability.verify…[cite: 5]
    resourceType: String, //[cite: 5]
    resourceId: { type: String, index: true }, //[cite: 5]
    targetUserId: { type: String, index: true }, // personne concernée par la donnée[cite: 5]
    outcome: { type: String, enum: ["success", "denied", "error"] }, //[cite: 5]
    legalBasis: String, // base légale invoquée pour l'accès[cite: 5]
    metadata: Schema.Types.Mixed, //[cite: 5]
    ipAddress: String, //[cite: 5]
    userAgent: String, //[cite: 5]
    occurredAt: { type: Date, default: Date.now, index: true }, //[cite: 5]
  },
  { collection: "audit_logs", versionKey: false }, //[cite: 5]
);

AuditLogSchema.index(
  { occurredAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 1095 },
); // 3 ans[cite: 5]

export type AuditLog = InferSchemaType<typeof AuditLogSchema>; //[cite: 5]
export const AuditLogModel = model("AuditLog", AuditLogSchema); //[cite: 5]
