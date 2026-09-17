export type QualificationCounts = {
  qualified: number;
  trainee: number;
  unqualified: number;
};

export type QualificationCategoryResult = {
  actual: number;
  limit: number;
  placesRemaining: number;
  isCompliant: boolean;
};

export type QualificationQuotaResult = {
  totalStaff: number;
  isCompliant: boolean;
  qualified: QualificationCategoryResult;
  trainee: QualificationCategoryResult;
  unqualified: QualificationCategoryResult;
};

function categoryResult(actual: number, limit: number, minimum: boolean): QualificationCategoryResult {
  return {
    actual,
    limit,
    placesRemaining: minimum ? Math.max(0, limit - actual) : Math.max(0, limit - actual),
    isCompliant: minimum ? actual >= limit : actual <= limit,
  };
}

export function calculateQualificationQuota(counts: QualificationCounts): QualificationQuotaResult {
  const totalStaff = counts.qualified + counts.trainee + counts.unqualified;
  const minimumQualified = Math.ceil(totalStaff * 0.5);
  const maximumTrainee = Math.floor(totalStaff * 0.3);
  const maximumUnqualified = Math.floor(totalStaff * 0.2);

  const qualified = categoryResult(counts.qualified, minimumQualified, true);
  const trainee = categoryResult(counts.trainee, maximumTrainee, false);
  const unqualified = categoryResult(counts.unqualified, maximumUnqualified, false);

  return {
    totalStaff,
    isCompliant: qualified.isCompliant && trainee.isCompliant && unqualified.isCompliant,
    qualified,
    trainee,
    unqualified,
  };
}
