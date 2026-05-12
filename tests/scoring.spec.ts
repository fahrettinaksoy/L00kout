import { describe, expect, it } from 'vitest'
import { percent, scoreToGrade } from '../server/utils/scoring'

describe('percent', () => {
  it('returns integer percentage', () => {
    expect(percent(1, 4)).toBe(25)
    expect(percent(2, 3)).toBe(67)
    expect(percent(9, 9)).toBe(100)
  })
  it('handles zero denominator', () => {
    expect(percent(1, 0)).toBe(0)
    expect(percent(0, 0)).toBe(0)
  })
})

describe('scoreToGrade', () => {
  it.each([
    [100, 'A'],
    [85, 'A'],
    [84, 'B'],
    [70, 'B'],
    [69, 'C'],
    [55, 'C'],
    [54, 'D'],
    [40, 'D'],
    [39, 'F'],
    [0, 'F'],
  ] as const)('scoreToGrade(%i) === %s', (score, grade) => {
    expect(scoreToGrade(score)).toBe(grade)
  })
  it('handles negative score', () => {
    expect(scoreToGrade(-10)).toBe('F')
  })
})
