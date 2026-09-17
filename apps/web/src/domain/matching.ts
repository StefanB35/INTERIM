export const rejectionReasons = {
  HONORABILITY_NOT_VERIFIED: 'HONORABILITY_NOT_VERIFIED',
  HONORABILITY_EXPIRED: 'HONORABILITY_EXPIRED',
  AGENDA_CONFLICT: 'AGENDA_CONFLICT',
  QUALIFICATION_QUOTA_REACHED: 'QUALIFICATION_QUOTA_REACHED',
  OUTSIDE_TRAVEL_RADIUS: 'OUTSIDE_TRAVEL_RADIUS',
} as const;

export type RejectionReason = keyof typeof rejectionReasons;
export const rejectionReasonLabels: Record<RejectionReason, string> = {
  HONORABILITY_NOT_VERIFIED: "Honorabilité non vérifiée",
  HONORABILITY_EXPIRED: "Attestation d'honorabilité expirée",
  AGENDA_CONFLICT: "Conflit ou chevauchement d'agenda",
  QUALIFICATION_QUOTA_REACHED: "Plafond de qualification atteint pour cette catégorie",
  OUTSIDE_TRAVEL_RADIUS: "Distance hors du rayon d'intervention déclaré",
};

export type QualificationCategory = 'QUALIFIED' | 'TRAINEE' | 'UNQUALIFIED';
export type AgeGroup = 'UNDER_6' | 'SIX_AND_OVER';
export type HonorabilityStatus = 'VERIFIED' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'NOT_SUBMITTED';
export type TimeInterval = { startsAt: Date | string; endsAt: Date | string };

export type MatchingMission = {
  startsAt: Date | string;
  endsAt: Date | string;
  latitude: number;
  longitude: number;
  ageGroup: AgeGroup;
  organizationId: string;
  requiredStaff: number;
  qualificationCounts: { trainee: number; unqualified: number };
};

export type MatchingCandidate = {
  id: string;
  honorabilityStatus: HonorabilityStatus;
  honorabilityExpiresAt: Date | string | null;
  latitude: number;
  longitude: number;
  travelRadiusKm: number;
  qualification: QualificationCategory;
  busyIntervals: TimeInterval[];
  exactAgeGroups: AgeGroup[];
  hasGeneralAnimationExperience: boolean;
  hasWorkedForOrganization: boolean;
};

export type MatchingInput = {
  mission: MatchingMission;
  candidates: MatchingCandidate[];
  computedAt?: Date;
};

export type ScoredCandidate = {
  candidate: MatchingCandidate;
  score: number;
  breakdown: { proximity: number; qualification: number; experience: number; continuity: number };
};

export type RejectedCandidate = {
  candidate: MatchingCandidate;
  reason: RejectionReason;
  label: string;
};

export type MatchingResult = {
  eligible: ScoredCandidate[];
  rejected: RejectedCandidate[];
  runId: string;
  computedAt: string;
};

function toDate(value: Date | string): Date { return value instanceof Date ? value : new Date(value); }
function overlaps(first: TimeInterval, second: TimeInterval): boolean {
  return toDate(first.startsAt) < toDate(second.endsAt) && toDate(second.startsAt) < toDate(first.endsAt);
}
function distanceInKm(firstLatitude: number, firstLongitude: number, secondLatitude: number, secondLongitude: number): number {
  const earthRadiusKm = 6371;
  const latitudeDelta = (secondLatitude - firstLatitude) * Math.PI / 180;
  const longitudeDelta = (secondLongitude - firstLongitude) * Math.PI / 180;
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(firstLatitude * Math.PI / 180) * Math.cos(secondLatitude * Math.PI / 180) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function proximityScore(distance: number): number { return distance <= 5 ? 40 : distance <= 15 ? 25 : distance <= 30 ? 10 : 0; }
function quotaReached(candidate: MatchingCandidate, mission: MatchingMission): boolean {
  if (candidate.qualification === 'TRAINEE') return mission.qualificationCounts.trainee >= Math.floor(mission.requiredStaff * 0.3);
  if (candidate.qualification === 'UNQUALIFIED') return mission.qualificationCounts.unqualified >= Math.floor(mission.requiredStaff * 0.2);
  return false;
}
function qualificationScore(qualification: QualificationCategory): number { return qualification === 'QUALIFIED' ? 30 : qualification === 'TRAINEE' ? 20 : 10; }
function experienceScore(candidate: MatchingCandidate, ageGroup: AgeGroup): number { return candidate.exactAgeGroups.includes(ageGroup) ? 20 : candidate.hasGeneralAnimationExperience ? 10 : 5; }
function rejection(candidate: MatchingCandidate, reason: RejectionReason): RejectedCandidate { return { candidate, reason, label: rejectionReasonLabels[reason] }; }

export function runMatching({ mission, candidates, computedAt = new Date() }: MatchingInput): MatchingResult {
  const eligible: ScoredCandidate[] = [];
  const rejected: RejectedCandidate[] = [];
  const missionInterval = { startsAt: mission.startsAt, endsAt: mission.endsAt };
  for (const candidate of candidates) {
    if (candidate.honorabilityStatus !== 'VERIFIED') { rejected.push(rejection(candidate, 'HONORABILITY_NOT_VERIFIED')); continue; }
    if (candidate.honorabilityExpiresAt && toDate(candidate.honorabilityExpiresAt) < computedAt) { rejected.push(rejection(candidate, 'HONORABILITY_EXPIRED')); continue; }
    if (candidate.busyIntervals.some((interval) => overlaps(interval, missionInterval))) { rejected.push(rejection(candidate, 'AGENDA_CONFLICT')); continue; }
    if (quotaReached(candidate, mission)) { rejected.push(rejection(candidate, 'QUALIFICATION_QUOTA_REACHED')); continue; }
    const distance = distanceInKm(candidate.latitude, candidate.longitude, mission.latitude, mission.longitude);
    if (distance > candidate.travelRadiusKm) { rejected.push(rejection(candidate, 'OUTSIDE_TRAVEL_RADIUS')); continue; }
    const breakdown = { proximity: proximityScore(distance), qualification: qualificationScore(candidate.qualification), experience: experienceScore(candidate, mission.ageGroup), continuity: candidate.hasWorkedForOrganization ? 10 : 0 };
    eligible.push({ candidate, score: breakdown.proximity + breakdown.qualification + breakdown.experience + breakdown.continuity, breakdown });
  }
  eligible.sort((first, second) => second.score - first.score);
  return { eligible, rejected, runId: `match-${computedAt.getTime()}`, computedAt: computedAt.toISOString() };
}
