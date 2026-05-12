/**
 * Pure scoring helpers shared between checks. Pure functions so they are
 * trivially unit-testable.
 */

export const SECURITY_GRADE_THRESHOLDS = [
  { min: 85, grade: 'A' },
  { min: 70, grade: 'B' },
  { min: 55, grade: 'C' },
  { min: 40, grade: 'D' },
  { min: 0, grade: 'F' },
] as const

export type SecurityGrade = (typeof SECURITY_GRADE_THRESHOLDS)[number]['grade']

export const scoreToGrade = (score: number): SecurityGrade => {
  for (const { min, grade } of SECURITY_GRADE_THRESHOLDS) {
    if (score >= min) return grade
  }
  return 'F'
}

export const percent = (numerator: number, denominator: number): number => {
  if (denominator <= 0) return 0
  return Math.round((numerator / denominator) * 100)
}
