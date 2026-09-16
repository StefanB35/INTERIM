-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ANIMATOR', 'EMPLOYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "LegalForm" AS ENUM ('ASSOCIATION', 'COMMUNE', 'EPCI', 'ENTREPRISE', 'OTHER');

-- CreateEnum
CREATE TYPE "OrgMemberRole" AS ENUM ('OWNER', 'ADMIN', 'SITE_DIRECTOR');

-- CreateEnum
CREATE TYPE "SlotBlock" AS ENUM ('MORNING', 'LUNCH', 'EVENING', 'WEDNESDAY');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('UNDER_6', 'SIX_AND_OVER');

-- CreateEnum
CREATE TYPE "QualificationLevel" AS ENUM ('QUALIFIED', 'TRAINEE', 'UNQUALIFIED');

-- CreateEnum
CREATE TYPE "QualificationType" AS ENUM ('BAFA', 'BAFD', 'BAFA_STAGIAIRE', 'CPJEPS', 'BPJEPS', 'DEJEPS', 'CAP_AEPE', 'EQUIVALENT', 'OTHER');

-- CreateEnum
CREATE TYPE "HonorabilityStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('NOT_EVALUATED', 'COMPLIANT', 'STAFF_SHORTAGE', 'QUALIFICATION_BREACH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('DRAFT', 'OPEN', 'FILLED', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MissionTrigger" AS ENUM ('MANUAL', 'COMPLIANCE_ENGINE', 'RESCHEDULE');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('STANDARD', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ApplicationOrigin" AS ENUM ('MATCHING', 'SPONTANEOUS', 'DIRECT_INVITE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUGGESTED', 'NOTIFIED', 'APPLIED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AssignmentSource" AS ENUM ('INTERNAL_STAFF', 'APIK_MISSION');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'GENERATED', 'SENT', 'SIGNED_BY_ANIMATOR', 'SIGNED_BY_EMPLOYER', 'ACTIVE', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'RESIDENCE_PERMIT', 'DIPLOMA', 'BANK_DETAILS', 'MISSION_CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'DISCORD', 'EMAIL');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'DEAD');

-- CreateEnum
CREATE TYPE "ConsentPurpose" AS ENUM ('TERMS_OF_SERVICE', 'MATCHING_NOTIFICATIONS', 'PROFILE_VISIBILITY', 'DOCUMENT_STORAGE');

-- CreateEnum
CREATE TYPE "DataRequestType" AS ENUM ('ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY');

-- CreateEnum
CREATE TYPE "DataRequestStatus" AS ENUM ('RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'REFUSED');

-- CreateEnum
CREATE TYPE "GeoLevel" AS ENUM ('COMMUNE', 'DEPARTMENT', 'REGION', 'NATIONAL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerifiedAt" TIMESTAMPTZ(3),
    "lastLoginAt" TIMESTAMPTZ(3),
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),
    "userAgent" VARCHAR(255),
    "ipAddress" INET,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "legalForm" "LegalForm" NOT NULL,
    "siret" CHAR(14),
    "nafCode" VARCHAR(6),
    "addressLine" VARCHAR(255) NOT NULL,
    "postalCode" CHAR(5) NOT NULL,
    "city" VARCHAR(120) NOT NULL,
    "inseeCode" CHAR(5),
    "contactEmail" VARCHAR(255) NOT NULL,
    "contactPhone" VARCHAR(30),
    "tamDeclarationNumber" VARCHAR(40),
    "isTamVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "role" "OrgMemberRole" NOT NULL DEFAULT 'SITE_DIRECTOR',
    "invitedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMPTZ(3),

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_access" (
    "memberId" UUID NOT NULL,
    "siteId" UUID NOT NULL,

    CONSTRAINT "site_access_pkey" PRIMARY KEY ("memberId","siteId")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "uaiCode" CHAR(8),
    "schoolName" VARCHAR(255),
    "addressLine" VARCHAR(255) NOT NULL,
    "postalCode" CHAR(5) NOT NULL,
    "city" VARCHAR(120) NOT NULL,
    "inseeCode" CHAR(5),
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "hasPedt" BOOLEAN NOT NULL DEFAULT false,
    "pedtValidUntil" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_sessions" (
    "id" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "block" "SlotBlock" NOT NULL,
    "startMinutes" SMALLINT NOT NULL,
    "endMinutes" SMALLINT NOT NULL,
    "childrenUnder6" SMALLINT NOT NULL DEFAULT 0,
    "children6AndOver" SMALLINT NOT NULL DEFAULT 0,
    "requiredStaffUnder6" SMALLINT NOT NULL DEFAULT 0,
    "requiredStaff6AndOver" SMALLINT NOT NULL DEFAULT 0,
    "requiredStaffTotal" SMALLINT NOT NULL DEFAULT 0,
    "assignedStaffTotal" SMALLINT NOT NULL DEFAULT 0,
    "qualifiedCount" SMALLINT NOT NULL DEFAULT 0,
    "traineeCount" SMALLINT NOT NULL DEFAULT 0,
    "unqualifiedCount" SMALLINT NOT NULL DEFAULT 0,
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'NOT_EVALUATED',
    "complianceComputedAt" TIMESTAMPTZ(3),
    "rulesetVersion" VARCHAR(20),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "care_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervision_rules" (
    "id" UUID NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "requiresPedt" BOOLEAN NOT NULL,
    "durationOver5h" BOOLEAN NOT NULL,
    "childrenPerStaff" SMALLINT NOT NULL,
    "legalReference" VARCHAR(120) NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveUntil" DATE,

    CONSTRAINT "supervision_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_members" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "firstName" VARCHAR(80) NOT NULL,
    "lastName" VARCHAR(80) NOT NULL,
    "qualificationLevel" "QualificationLevel" NOT NULL,
    "honorabilityStatus" "HonorabilityStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "source" "AssignmentSource" NOT NULL,
    "staffMemberId" UUID,
    "animatorProfileId" UUID,
    "missionId" UUID,
    "qualificationLevel" "QualificationLevel" NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PLANNED',
    "cancelledAt" TIMESTAMPTZ(3),
    "cancellationReason" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animator_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "firstName" VARCHAR(80) NOT NULL,
    "lastName" VARCHAR(80) NOT NULL,
    "phone" VARCHAR(30),
    "birthDate" DATE NOT NULL,
    "bio" TEXT,
    "addressLine" VARCHAR(255),
    "postalCode" CHAR(5) NOT NULL,
    "city" VARCHAR(120) NOT NULL,
    "inseeCode" CHAR(5),
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "travelRadiusKm" SMALLINT NOT NULL DEFAULT 15,
    "hasVehicle" BOOLEAN NOT NULL DEFAULT false,
    "qualificationLevel" "QualificationLevel" NOT NULL DEFAULT 'UNQUALIFIED',
    "experienceYears" SMALLINT NOT NULL DEFAULT 0,
    "honorabilityStatus" "HonorabilityStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "honorabilityCheckedAt" TIMESTAMPTZ(3),
    "honorabilityExpiresAt" DATE,
    "honorabilityCheckedByOrgId" UUID,
    "weeklyHoursTarget" SMALLINT NOT NULL DEFAULT 35,
    "isSearching" BOOLEAN NOT NULL DEFAULT true,
    "profileCompletion" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "animator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualifications" (
    "id" UUID NOT NULL,
    "animatorProfileId" UUID NOT NULL,
    "type" "QualificationType" NOT NULL,
    "label" VARCHAR(180),
    "obtainedAt" DATE,
    "expiresAt" DATE,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMPTZ(3),
    "documentId" UUID,

    CONSTRAINT "qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_rules" (
    "id" UUID NOT NULL,
    "animatorProfileId" UUID NOT NULL,
    "weekday" SMALLINT NOT NULL,
    "block" "SlotBlock" NOT NULL,
    "startMinutes" SMALLINT NOT NULL,
    "endMinutes" SMALLINT NOT NULL,
    "validFrom" DATE NOT NULL,
    "validUntil" DATE,

    CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_exceptions" (
    "id" UUID NOT NULL,
    "animatorProfileId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "block" "SlotBlock",
    "isAvailable" BOOLEAN NOT NULL,
    "reason" VARCHAR(180),

    CONSTRAINT "availability_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_details" (
    "id" UUID NOT NULL,
    "animatorProfileId" UUID NOT NULL,
    "holderName" VARCHAR(140) NOT NULL,
    "ibanCiphertext" BYTEA NOT NULL,
    "ibanIv" BYTEA NOT NULL,
    "ibanAuthTag" BYTEA NOT NULL,
    "ibanLast4" CHAR(4) NOT NULL,
    "bicCiphertext" BYTEA,
    "bicIv" BYTEA,
    "bicAuthTag" BYTEA,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stored_documents" (
    "id" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(120) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" VARCHAR(255) NOT NULL,
    "encryptionIv" BYTEA NOT NULL,
    "encryptionTag" BYTEA NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "checksumSha256" CHAR(64) NOT NULL,
    "uploadedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retentionUntil" DATE,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "stored_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "reference" VARCHAR(24) NOT NULL,
    "publicSlug" VARCHAR(180) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT NOT NULL,
    "romeCode" VARCHAR(8) NOT NULL DEFAULT 'G1203',
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "block" "SlotBlock" NOT NULL,
    "totalHours" DECIMAL(6,2) NOT NULL,
    "minQualificationLevel" "QualificationLevel" NOT NULL DEFAULT 'UNQUALIFIED',
    "minExperienceYears" SMALLINT NOT NULL DEFAULT 0,
    "requiredPositions" SMALLINT NOT NULL DEFAULT 1,
    "filledPositions" SMALLINT NOT NULL DEFAULT 0,
    "hourlyRateCents" INTEGER NOT NULL,
    "marketMedianRateCents" INTEGER,
    "marketSampleSize" SMALLINT,
    "status" "MissionStatus" NOT NULL DEFAULT 'DRAFT',
    "trigger" "MissionTrigger" NOT NULL DEFAULT 'MANUAL',
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'STANDARD',
    "publishedAt" TIMESTAMPTZ(3),
    "filledAt" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_slots" (
    "missionId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,

    CONSTRAINT "mission_slots_pkey" PRIMARY KEY ("missionId","sessionId")
);

-- CreateTable
CREATE TABLE "mission_applications" (
    "id" UUID NOT NULL,
    "missionId" UUID NOT NULL,
    "animatorProfileId" UUID NOT NULL,
    "origin" "ApplicationOrigin" NOT NULL DEFAULT 'MATCHING',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUGGESTED',
    "score" DECIMAL(5,2),
    "matchRunId" VARCHAR(40),
    "algorithmVersion" VARCHAR(20),
    "notifiedAt" TIMESTAMPTZ(3),
    "respondedAt" TIMESTAMPTZ(3),
    "decidedAt" TIMESTAMPTZ(3),
    "message" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "mission_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL,
    "missionId" UUID NOT NULL,
    "animatorProfileId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "reference" VARCHAR(24) NOT NULL,
    "recourseReason" VARCHAR(255) NOT NULL,
    "jobTitle" VARCHAR(180) NOT NULL,
    "jobQualification" VARCHAR(180) NOT NULL,
    "workplaceAddress" VARCHAR(255) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "weeklyHours" DECIMAL(5,2) NOT NULL,
    "hourlyRateCents" INTEGER NOT NULL,
    "trialPeriodDays" SMALLINT NOT NULL,
    "collectiveAgreement" VARCHAR(120) NOT NULL DEFAULT 'ÉCLAT',
    "specificClauses" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "pdfDocumentId" UUID,
    "generatedAt" TIMESTAMPTZ(3),
    "sentAt" TIMESTAMPTZ(3),
    "signedAt" TIMESTAMPTZ(3),
    "terminatedAt" TIMESTAMPTZ(3),
    "n8nExecutionId" VARCHAR(60),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_indicators" (
    "id" UUID NOT NULL,
    "romeCode" VARCHAR(8) NOT NULL,
    "geoLevel" "GeoLevel" NOT NULL,
    "geoCode" VARCHAR(10) NOT NULL,
    "geoLabel" VARCHAR(140) NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "offerCount" INTEGER NOT NULL,
    "medianHourlyRateCents" INTEGER,
    "p25HourlyRateCents" INTEGER,
    "p75HourlyRateCents" INTEGER,
    "tensionIndex" DECIMAL(5,2),
    "source" VARCHAR(60) NOT NULL,
    "importBatchId" VARCHAR(40),
    "computedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "type" VARCHAR(60) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "body" TEXT NOT NULL,
    "linkUrl" VARCHAR(255),
    "sentAt" TIMESTAMPTZ(3),
    "readAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_outbox" (
    "id" UUID NOT NULL,
    "eventType" VARCHAR(60) NOT NULL,
    "aggregateId" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" SMALLINT NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextRetryAt" TIMESTAMPTZ(3),
    "deliveredAt" TIMESTAMPTZ(3),
    "n8nExecutionId" VARCHAR(60),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "purpose" "ConsentPurpose" NOT NULL,
    "isGranted" BOOLEAN NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "grantedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ(3),
    "ipAddress" INET,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_requests" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "DataRequestType" NOT NULL,
    "status" "DataRequestStatus" NOT NULL DEFAULT 'RECEIVED',
    "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMPTZ(3) NOT NULL,
    "completedAt" TIMESTAMPTZ(3),
    "handledBy" UUID,
    "notes" TEXT,

    CONSTRAINT "data_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_role_idx" ON "users"("status", "role");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_expiresAt_idx" ON "refresh_tokens"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_siret_key" ON "organizations"("siret");

-- CreateIndex
CREATE INDEX "organizations_postalCode_idx" ON "organizations"("postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_userId_organizationId_key" ON "organization_members"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "sites_organizationId_isActive_idx" ON "sites"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "sites_postalCode_idx" ON "sites"("postalCode");

-- CreateIndex
CREATE INDEX "sites_latitude_longitude_idx" ON "sites"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "care_sessions_date_complianceStatus_idx" ON "care_sessions"("date", "complianceStatus");

-- CreateIndex
CREATE UNIQUE INDEX "care_sessions_siteId_date_block_key" ON "care_sessions"("siteId", "date", "block");

-- CreateIndex
CREATE UNIQUE INDEX "supervision_rules_ageGroup_requiresPedt_durationOver5h_vers_key" ON "supervision_rules"("ageGroup", "requiresPedt", "durationOver5h", "version");

-- CreateIndex
CREATE INDEX "staff_members_organizationId_isActive_idx" ON "staff_members"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "assignments_animatorProfileId_status_idx" ON "assignments"("animatorProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_sessionId_animatorProfileId_key" ON "assignments"("sessionId", "animatorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_sessionId_staffMemberId_key" ON "assignments"("sessionId", "staffMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "animator_profiles_userId_key" ON "animator_profiles"("userId");

-- CreateIndex
CREATE INDEX "animator_profiles_isSearching_honorabilityStatus_idx" ON "animator_profiles"("isSearching", "honorabilityStatus");

-- CreateIndex
CREATE INDEX "animator_profiles_latitude_longitude_idx" ON "animator_profiles"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "animator_profiles_postalCode_idx" ON "animator_profiles"("postalCode");

-- CreateIndex
CREATE INDEX "qualifications_animatorProfileId_isVerified_idx" ON "qualifications"("animatorProfileId", "isVerified");

-- CreateIndex
CREATE INDEX "availability_rules_weekday_block_idx" ON "availability_rules"("weekday", "block");

-- CreateIndex
CREATE UNIQUE INDEX "availability_rules_animatorProfileId_weekday_block_validFro_key" ON "availability_rules"("animatorProfileId", "weekday", "block", "validFrom");

-- CreateIndex
CREATE INDEX "availability_exceptions_date_idx" ON "availability_exceptions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "availability_exceptions_animatorProfileId_date_block_key" ON "availability_exceptions"("animatorProfileId", "date", "block");

-- CreateIndex
CREATE UNIQUE INDEX "payment_details_animatorProfileId_key" ON "payment_details"("animatorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "stored_documents_storageKey_key" ON "stored_documents"("storageKey");

-- CreateIndex
CREATE INDEX "stored_documents_ownerUserId_type_idx" ON "stored_documents"("ownerUserId", "type");

-- CreateIndex
CREATE INDEX "stored_documents_retentionUntil_idx" ON "stored_documents"("retentionUntil");

-- CreateIndex
CREATE UNIQUE INDEX "missions_reference_key" ON "missions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "missions_publicSlug_key" ON "missions"("publicSlug");

-- CreateIndex
CREATE INDEX "missions_status_startDate_idx" ON "missions"("status", "startDate");

-- CreateIndex
CREATE INDEX "missions_organizationId_status_idx" ON "missions"("organizationId", "status");

-- CreateIndex
CREATE INDEX "missions_urgency_status_idx" ON "missions"("urgency", "status");

-- CreateIndex
CREATE INDEX "mission_applications_animatorProfileId_status_idx" ON "mission_applications"("animatorProfileId", "status");

-- CreateIndex
CREATE INDEX "mission_applications_missionId_score_idx" ON "mission_applications"("missionId", "score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "mission_applications_missionId_animatorProfileId_key" ON "mission_applications"("missionId", "animatorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_reference_key" ON "contracts"("reference");

-- CreateIndex
CREATE INDEX "contracts_animatorProfileId_status_idx" ON "contracts"("animatorProfileId", "status");

-- CreateIndex
CREATE INDEX "contracts_organizationId_startDate_idx" ON "contracts"("organizationId", "startDate");

-- CreateIndex
CREATE INDEX "market_indicators_geoLevel_geoCode_idx" ON "market_indicators"("geoLevel", "geoCode");

-- CreateIndex
CREATE UNIQUE INDEX "market_indicators_romeCode_geoLevel_geoCode_periodStart_sou_key" ON "market_indicators"("romeCode", "geoLevel", "geoCode", "periodStart", "source");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

-- CreateIndex
CREATE INDEX "webhook_outbox_status_nextRetryAt_idx" ON "webhook_outbox"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "consents_userId_purpose_idx" ON "consents"("userId", "purpose");

-- CreateIndex
CREATE INDEX "data_requests_status_dueAt_idx" ON "data_requests"("status", "dueAt");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_access" ADD CONSTRAINT "site_access_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "organization_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_access" ADD CONSTRAINT "site_access_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_sessions" ADD CONSTRAINT "care_sessions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "care_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_animatorProfileId_fkey" FOREIGN KEY ("animatorProfileId") REFERENCES "animator_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animator_profiles" ADD CONSTRAINT "animator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_animatorProfileId_fkey" FOREIGN KEY ("animatorProfileId") REFERENCES "animator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "stored_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_animatorProfileId_fkey" FOREIGN KEY ("animatorProfileId") REFERENCES "animator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_exceptions" ADD CONSTRAINT "availability_exceptions_animatorProfileId_fkey" FOREIGN KEY ("animatorProfileId") REFERENCES "animator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_animatorProfileId_fkey" FOREIGN KEY ("animatorProfileId") REFERENCES "animator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stored_documents" ADD CONSTRAINT "stored_documents_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_slots" ADD CONSTRAINT "mission_slots_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_slots" ADD CONSTRAINT "mission_slots_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "care_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_applications" ADD CONSTRAINT "mission_applications_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_applications" ADD CONSTRAINT "mission_applications_animatorProfileId_fkey" FOREIGN KEY ("animatorProfileId") REFERENCES "animator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_animatorProfileId_fkey" FOREIGN KEY ("animatorProfileId") REFERENCES "animator_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_pdfDocumentId_fkey" FOREIGN KEY ("pdfDocumentId") REFERENCES "stored_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_requests" ADD CONSTRAINT "data_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
