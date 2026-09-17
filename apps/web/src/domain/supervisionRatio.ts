export type SupervisionRatioInput = {
  childrenUnder6: number;
  children6AndOver: number;
  hasPedt: boolean;
  durationHours: number;
  presentStaff?: number;
};

export type SupervisionBreakdown = {
  childrenUnder6: number;
  children6AndOver: number;
  ratioUnder6: number;
  ratio6AndOver: number;
  requiredUnder6: number;
  required6AndOver: number;
  hasPedt: boolean;
  durationHours: number;
  durationOver5: boolean;
};

export type SupervisionRatioResult = {
  requiredStaff: number;
  presentStaff: number;
  gap: number;
  isCompliant: boolean;
  opensVacancy: boolean;
  breakdown: SupervisionBreakdown;
};

function requiredFor(children: number, childrenPerStaff: number): number {
  return Math.ceil(children / childrenPerStaff);
}

export function calculateSupervisionRatio(input: SupervisionRatioInput): SupervisionRatioResult {
  const ratioUnder6 = input.hasPedt ? 14 : 10;
  const ratio6AndOver = input.hasPedt ? 18 : 14;
  const requiredUnder6 = requiredFor(input.childrenUnder6, ratioUnder6);
  const required6AndOver = requiredFor(input.children6AndOver, ratio6AndOver);
  const requiredStaff = requiredUnder6 + required6AndOver;
  const presentStaff = input.presentStaff ?? 0;
  const gap = presentStaff - requiredStaff;

  return {
    requiredStaff,
    presentStaff,
    gap,
    isCompliant: gap >= 0,
    opensVacancy: gap < 0,
    breakdown: {
      childrenUnder6: input.childrenUnder6,
      children6AndOver: input.children6AndOver,
      ratioUnder6,
      ratio6AndOver,
      requiredUnder6,
      required6AndOver,
      hasPedt: input.hasPedt,
      durationHours: input.durationHours,
      durationOver5: input.durationHours > 5,
    },
  };
}
