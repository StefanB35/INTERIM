import { describe, expect, it } from 'vitest';
import { calculateQualificationQuota } from './qualificationQuota';

describe('calculateQualificationQuota', () => {
  it('gère une équipe vide', () => expect(calculateQualificationQuota({ qualified: 0, trainee: 0, unqualified: 0 })).toMatchObject({ totalStaff: 0, isCompliant: true }));
  it('valide les seuils exacts, dont 20 % de non qualifiés', () => {
    const result = calculateQualificationQuota({ qualified: 5, trainee: 3, unqualified: 2 });
    expect(result).toMatchObject({ isCompliant: true, qualified: { placesRemaining: 0 }, trainee: { placesRemaining: 0 }, unqualified: { limit: 2, placesRemaining: 0 } });
  });
  it('signale les dépassements et les places restantes', () => {
    const result = calculateQualificationQuota({ qualified: 4, trainee: 4, unqualified: 3 });
    expect(result.isCompliant).toBe(false);
    expect(result.qualified.placesRemaining).toBe(2);
    expect(result.trainee.isCompliant).toBe(false);
    expect(result.unqualified.isCompliant).toBe(false);
  });
});
