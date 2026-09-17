import { describe, expect, it } from 'vitest';
import { rejectionReasons, runMatching, type MatchingCandidate, type MatchingMission } from './matching';

const mission: MatchingMission = { startsAt: '2026-09-20T07:30:00Z', endsAt: '2026-09-20T08:30:00Z', latitude: 48.8566, longitude: 2.3522, ageGroup: 'SIX_AND_OVER', organizationId: 'org-1', requiredStaff: 10, qualificationCounts: { trainee: 0, unqualified: 0 } };
function candidate(overrides: Partial<MatchingCandidate> = {}): MatchingCandidate { return { id: 'candidate-1', honorabilityStatus: 'VERIFIED', honorabilityExpiresAt: '2026-12-31T00:00:00Z', latitude: 48.8566, longitude: 2.3522, travelRadiusKm: 30, qualification: 'QUALIFIED', busyIntervals: [], exactAgeGroups: ['SIX_AND_OVER'], hasGeneralAnimationExperience: true, hasWorkedForOrganization: true, ...overrides }; }
function distanceCandidate(distanceKm: number): MatchingCandidate { return candidate({ latitude: mission.latitude + distanceKm / 111.2 }); }

describe('runMatching', () => {
  it('classe un candidat avec le score maximal', () => expect(runMatching({ mission, candidates: [candidate()], computedAt: new Date('2026-09-16T00:00:00Z') }).eligible[0]).toMatchObject({ score: 100, breakdown: { proximity: 40, qualification: 30, experience: 20, continuity: 10 } }));
  it.each([[5, 40], [15, 25], [30, 10]])('applique la borne de distance %s km', (distance, score) => expect(runMatching({ mission, candidates: [distanceCandidate(distance)], computedAt: new Date('2026-09-16T00:00:00Z') }).eligible[0]?.breakdown.proximity).toBe(score));
  it('rejette au-delà du rayon déclaré', () => expect(runMatching({ mission, candidates: [distanceCandidate(31)], computedAt: new Date('2026-09-16T00:00:00Z') }).rejected[0]).toMatchObject({ reason: rejectionReasons.OUTSIDE_TRAVEL_RADIUS }));
  it.each([
    ['PENDING', 'HONORABILITY_NOT_VERIFIED'], ['NOT_SUBMITTED', 'HONORABILITY_NOT_VERIFIED'], ['VERIFIED', 'HONORABILITY_EXPIRED'],
  ] as const)('applique le verrou honorabilité %s', (status, reason) => {
    const expires = status === 'VERIFIED' ? '2026-09-15T23:59:59Z' : candidate().honorabilityExpiresAt;
    expect(runMatching({ mission, candidates: [candidate({ honorabilityStatus: status, honorabilityExpiresAt: expires })], computedAt: new Date('2026-09-16T00:00:00Z') }).rejected[0]?.reason).toBe(reason);
  });
  it('rejette un conflit temporel', () => expect(runMatching({ mission, candidates: [candidate({ busyIntervals: [{ startsAt: '2026-09-20T08:00:00Z', endsAt: '2026-09-20T09:00:00Z' }] })] }).rejected[0]?.reason).toBe('AGENDA_CONFLICT'));
  it('rejette le plafond de non qualifiés à 20 %', () => expect(runMatching({ mission: { ...mission, qualificationCounts: { trainee: 0, unqualified: 2 } }, candidates: [candidate({ qualification: 'UNQUALIFIED' })] }).rejected[0]?.reason).toBe('QUALIFICATION_QUOTA_REACHED'));
  it('score un stagiaire, un non qualifié et un débutant dans leurs quotas', () => {
    const result = runMatching({ mission: { ...mission, qualificationCounts: { trainee: 0, unqualified: 0 } }, candidates: [candidate({ id: 'trainee', qualification: 'TRAINEE', exactAgeGroups: [], hasGeneralAnimationExperience: true, hasWorkedForOrganization: false }), candidate({ id: 'unqualified', qualification: 'UNQUALIFIED', exactAgeGroups: [], hasGeneralAnimationExperience: false, hasWorkedForOrganization: false })] });
    expect(result.eligible.map((item) => item.breakdown.qualification)).toEqual([20, 10]);
    expect(result.eligible.map((item) => item.breakdown.experience)).toEqual([10, 5]);
    expect(result.eligible.every((item) => item.breakdown.continuity === 0)).toBe(true);
  });
  it('couvre une distance de plus de 30 km dans un rayon assez large', () => {
    const farCandidate = { ...distanceCandidate(31), travelRadiusKm: 40 };
    expect(runMatching({ mission, candidates: [farCandidate], computedAt: new Date('2026-09-16T00:00:00Z') }).eligible[0]?.breakdown.proximity).toBe(0);
  });
  it('ignore un intervalle adjacent sans chevauchement', () => expect(runMatching({ mission, candidates: [candidate({ busyIntervals: [{ startsAt: '2026-09-20T08:30:00Z', endsAt: '2026-09-20T09:00:00Z' }] })] }).eligible).toHaveLength(1));
  it('accepte les dates natives dans les données du candidat', () => expect(runMatching({ mission, candidates: [candidate({ honorabilityExpiresAt: new Date('2026-12-31T00:00:00Z'), busyIntervals: [{ startsAt: new Date('2026-09-20T09:00:00Z'), endsAt: new Date('2026-09-20T10:00:00Z') }] })] }).eligible).toHaveLength(1));
  it('retourne une trace rejouable', () => expect(runMatching({ mission, candidates: [], computedAt: new Date('2026-09-16T00:00:00Z') })).toMatchObject({ runId: 'match-1789516800000', computedAt: '2026-09-16T00:00:00.000Z', eligible: [], rejected: [] }));
});
