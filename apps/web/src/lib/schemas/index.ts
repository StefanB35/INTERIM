import { z } from 'zod';

const dateTime = z.string().datetime({ offset: true });
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date ISO attendue');
const uuid = z.string().min(1);

export const UserSchema = z.object({
  id: uuid, email: z.string().email(), role: z.enum(['ANIMATOR', 'EMPLOYER', 'ADMIN']), status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DELETED']),
  emailVerifiedAt: dateTime.nullable(), lastLoginAt: dateTime.nullable(), createdAt: dateTime, updatedAt: dateTime,
});
export type User = z.infer<typeof UserSchema>;
export const AuthResponseSchema = z.object({ accessToken: z.string().min(1), user: UserSchema });
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const EmployerProfileSchema = z.object({
  id: uuid, name: z.string(), legalForm: z.enum(['ASSOCIATION', 'COMMUNE', 'EPCI', 'ENTREPRISE', 'OTHER']), siret: z.string().nullable(), nafCode: z.string().nullable(),
  addressLine: z.string(), postalCode: z.string(), city: z.string(), inseeCode: z.string().nullable(), contactEmail: z.string().email(), contactPhone: z.string().nullable(),
  tamDeclarationNumber: z.string().nullable(), isTamVerified: z.boolean(), createdAt: dateTime, updatedAt: dateTime,
});
export type EmployerProfile = z.infer<typeof EmployerProfileSchema>;

export const SchoolSchema = z.object({
  id: uuid, organizationId: uuid, name: z.string(), uaiCode: z.string().nullable(), schoolName: z.string().nullable(), addressLine: z.string(), postalCode: z.string(), city: z.string(), inseeCode: z.string().nullable(), latitude: z.number(), longitude: z.number(), hasPedt: z.boolean(), pedtValidUntil: date.nullable(), isActive: z.boolean(),
});
export type School = z.infer<typeof SchoolSchema>;

export const GroupSchema = z.object({ id: uuid, schoolId: uuid, name: z.string(), childrenUnder6: z.number().int().nonnegative(), children6AndOver: z.number().int().nonnegative(), totalChildren: z.number().int().nonnegative() });
export type Group = z.infer<typeof GroupSchema>;

export const AnimatorProfileSchema = z.object({
  id: uuid, userId: uuid, firstName: z.string(), lastName: z.string(), phone: z.string().nullable(), birthDate: date, bio: z.string().nullable(), addressLine: z.string().nullable(), postalCode: z.string(), city: z.string(), inseeCode: z.string().nullable(), latitude: z.number(), longitude: z.number(), travelRadiusKm: z.number().int().nonnegative(), hasVehicle: z.boolean(), qualificationLevel: z.enum(['QUALIFIED', 'TRAINEE', 'UNQUALIFIED']), experienceYears: z.number().int().nonnegative(), honorabilityStatus: z.enum(['NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED']), honorabilityCheckedAt: dateTime.nullable(), honorabilityExpiresAt: date.nullable(), weeklyHoursTarget: z.number().int().nonnegative(), isSearching: z.boolean(), profileCompletion: z.number().int().min(0).max(100),
});
export type AnimatorProfile = z.infer<typeof AnimatorProfileSchema>;

export const AvailabilitySchema = z.object({ id: uuid, animatorProfileId: uuid, weekday: z.number().int().min(1).max(7), block: z.enum(['MORNING', 'LUNCH', 'EVENING', 'WEDNESDAY']), startMinutes: z.number().int().min(0).max(1440), endMinutes: z.number().int().min(0).max(1440), validFrom: date, validUntil: date.nullable() });
export type Availability = z.infer<typeof AvailabilitySchema>;

export const CareSessionSchema = z.object({
  id: uuid, siteId: uuid, date, block: z.enum(['MORNING', 'LUNCH', 'EVENING', 'WEDNESDAY']), startMinutes: z.number().int(), endMinutes: z.number().int(), childrenUnder6: z.number().int().nonnegative(), children6AndOver: z.number().int().nonnegative(), requiredStaffUnder6: z.number().int().nonnegative(), requiredStaff6AndOver: z.number().int().nonnegative(), requiredStaffTotal: z.number().int().nonnegative(), assignedStaffTotal: z.number().int().nonnegative(), qualifiedCount: z.number().int().nonnegative(), traineeCount: z.number().int().nonnegative(), unqualifiedCount: z.number().int().nonnegative(), complianceStatus: z.enum(['NOT_EVALUATED', 'COMPLIANT', 'STAFF_SHORTAGE', 'QUALIFICATION_BREACH', 'CRITICAL']), complianceComputedAt: dateTime.nullable(), rulesetVersion: z.string().nullable(),
});
export type CareSession = z.infer<typeof CareSessionSchema>;

export const MissionSchema = z.object({
  id: uuid, organizationId: uuid, siteId: uuid, reference: z.string(), publicSlug: z.string(), title: z.string(), description: z.string(), romeCode: z.string(), startDate: date, endDate: date, block: z.enum(['MORNING', 'LUNCH', 'EVENING', 'WEDNESDAY']), totalHours: z.number(), minQualificationLevel: z.enum(['QUALIFIED', 'TRAINEE', 'UNQUALIFIED']), minExperienceYears: z.number().int().nonnegative(), requiredPositions: z.number().int().positive(), filledPositions: z.number().int().nonnegative(), hourlyRateCents: z.number().int().nonnegative(), marketMedianRateCents: z.number().int().nonnegative().nullable(), marketSampleSize: z.number().int().nonnegative().nullable(), status: z.enum(['DRAFT', 'OPEN', 'FILLED', 'COMPLETED', 'CANCELLED', 'EXPIRED']), trigger: z.enum(['MANUAL', 'COMPLIANCE_ENGINE', 'RESCHEDULE']), urgency: z.enum(['STANDARD', 'URGENT', 'CRITICAL']), publishedAt: dateTime.nullable(), filledAt: dateTime.nullable(), expiresAt: dateTime.nullable(),
});
export type Mission = z.infer<typeof MissionSchema>;
export const AnimatorProposalSchema = MissionSchema.extend({ distanceFromPreviousKm: z.number().nonnegative(), travelMinutes: z.number().int().nonnegative(), paidDurationHours: z.number().nonnegative(), hoursAfterAcceptance: z.number().nonnegative(), proposalStatus: z.enum(['PENDING', 'ACCEPTED', 'PASSED']) });
export type AnimatorProposal = z.infer<typeof AnimatorProposalSchema>;

export const CandidateSchema = AnimatorProfileSchema.extend({ score: z.number().min(0).max(100).nullable(), scoreBreakdown: z.object({ proximity: z.number().nonnegative(), qualification: z.number().nonnegative(), experience: z.number().nonnegative(), continuity: z.number().nonnegative() }).nullable(), matchStatus: z.enum(['ELIGIBLE', 'REJECTED']), rejectionReason: z.enum(['HONORABILITY_NOT_VERIFIED', 'HONORABILITY_EXPIRED', 'AGENDA_CONFLICT', 'QUALIFICATION_QUOTA_REACHED', 'OUTSIDE_TRAVEL_RADIUS']).nullable(), rejectionLabel: z.string().nullable(), distanceKm: z.number().nonnegative().nullable() });
export type Candidate = z.infer<typeof CandidateSchema>;

export const MatchRunSchema = z.object({ id: uuid, missionId: uuid, algorithmVersion: z.string(), computedAt: dateTime, eligible: z.array(CandidateSchema), rejected: z.array(CandidateSchema), totalCandidates: z.number().int().nonnegative() });
export type MatchRun = z.infer<typeof MatchRunSchema>;

export const ContractSchema = z.object({ id: uuid, missionId: uuid, animatorProfileId: uuid, organizationId: uuid, reference: z.string(), recourseReason: z.string(), jobTitle: z.string(), jobQualification: z.string(), workplaceAddress: z.string(), startDate: date, endDate: date, weeklyHours: z.number(), hourlyRateCents: z.number().int().nonnegative(), trialPeriodDays: z.number().int().nonnegative(), collectiveAgreement: z.string(), specificClauses: z.string().nullable(), status: z.enum(['DRAFT', 'GENERATED', 'SENT', 'SIGNED_BY_ANIMATOR', 'SIGNED_BY_EMPLOYER', 'ACTIVE', 'COMPLETED', 'TERMINATED']), pdfDocumentId: uuid.nullable(), generatedAt: dateTime.nullable(), sentAt: dateTime.nullable(), signedAt: dateTime.nullable(), terminatedAt: dateTime.nullable(), n8nExecutionId: z.string().nullable() });
export type Contract = z.infer<typeof ContractSchema>;

export const TensionIndicatorSchema = z.object({ id: uuid, romeCode: z.string(), geoLevel: z.enum(['COMMUNE', 'DEPARTMENT', 'REGION', 'NATIONAL']), geoCode: z.string(), geoLabel: z.string(), periodStart: date, periodEnd: date, offerCount: z.number().int().nonnegative(), medianHourlyRateCents: z.number().int().nonnegative().nullable(), p25HourlyRateCents: z.number().int().nonnegative().nullable(), p75HourlyRateCents: z.number().int().nonnegative().nullable(), tensionIndex: z.number().nullable(), source: z.string(), importBatchId: z.string().nullable(), computedAt: dateTime });
export type TensionIndicator = z.infer<typeof TensionIndicatorSchema>;

export const ApiListSchema = <T extends z.ZodType>(item: T) => z.object({ data: z.array(item), total: z.number().int().nonnegative() });
