import { describe, expect, it } from 'vitest';
import { calculateSupervisionRatio } from './supervisionRatio';

describe('calculateSupervisionRatio', () => {
  it.each([
    [false, 4, 10, 14], [false, 6, 10, 14], [true, 4, 14, 18], [true, 6, 14, 18],
  ])('applique la configuration PEDT=%s et durée=%sh', (hasPedt, durationHours, ratioUnder6, ratio6AndOver) => {
    const result = calculateSupervisionRatio({ childrenUnder6: 11, children6AndOver: 15, hasPedt, durationHours, presentStaff: 3 });
    expect(result.breakdown.ratioUnder6).toBe(ratioUnder6);
    expect(result.breakdown.ratio6AndOver).toBe(ratio6AndOver);
    expect(result.breakdown.durationOver5).toBe(durationHours > 5);
  });
  it('retourne zéro requis pour zéro enfant', () => expect(calculateSupervisionRatio({ childrenUnder6: 0, children6AndOver: 0, hasPedt: false, durationHours: 2, presentStaff: 0 })).toMatchObject({ requiredStaff: 0, gap: 0, isCompliant: true, opensVacancy: false }));
  it('arrondit au supérieur et ouvre un besoin sous le seuil', () => expect(calculateSupervisionRatio({ childrenUnder6: 10, children6AndOver: 15, hasPedt: false, durationHours: 6, presentStaff: 2 })).toMatchObject({ requiredStaff: 3, gap: -1, isCompliant: false, opensVacancy: true }));
  it('est conforme pile au seuil', () => expect(calculateSupervisionRatio({ childrenUnder6: 10, children6AndOver: 14, hasPedt: false, durationHours: 5, presentStaff: 2 })).toMatchObject({ requiredStaff: 2, gap: 0, isCompliant: true, opensVacancy: false }));
  it('considère zéro présent quand le personnel n’est pas fourni', () => expect(calculateSupervisionRatio({ childrenUnder6: 1, children6AndOver: 0, hasPedt: false, durationHours: 1 })).toMatchObject({ presentStaff: 0, gap: -1, opensVacancy: true }));
});
