import { describe, it, expect } from 'vitest'
import {
  calculateCalories,
  calculateCaloriesFallback,
  kgToLbs,
  lbsToKg,
  cmToFtIn,
  ftInToCm,
  formatHeight,
  formatWeight,
} from './calories'

describe('Unit Conversions', () => {
  describe('kgToLbs', () => {
    it('converts 0 kg to 0 lbs', () => {
      expect(kgToLbs(0)).toBe(0)
    })
    it('converts 1 kg correctly', () => {
      expect(kgToLbs(1)).toBeCloseTo(2.2, 0)
    })
    it('converts 70 kg correctly', () => {
      expect(kgToLbs(70)).toBeCloseTo(154.4, 0)
    })
    it('converts 100 kg correctly', () => {
      expect(kgToLbs(100)).toBeCloseTo(220.5, 0)
    })
  })

  describe('lbsToKg', () => {
    it('converts 0 lbs to 0 kg', () => {
      expect(lbsToKg(0)).toBe(0)
    })
    it('converts 154 lbs correctly', () => {
      expect(lbsToKg(154)).toBeCloseTo(69.8, 0)
    })
    it('round-trips with kgToLbs', () => {
      const original = 75
      const converted = lbsToKg(kgToLbs(original))
      expect(converted).toBeCloseTo(original, 0)
    })
  })

  describe('cmToFtIn', () => {
    it('converts 170 cm correctly', () => {
      const result = cmToFtIn(170)
      expect(result.ft).toBe(5)
      expect(result.in).toBeCloseTo(7, 0)
    })
    it('converts 183 cm correctly', () => {
      const result = cmToFtIn(183)
      expect(result.ft).toBe(6)
      expect(result.in).toBeCloseTo(0, 0)
    })
    it('converts 152 cm correctly', () => {
      const result = cmToFtIn(152)
      expect(result.ft).toBe(4)
      expect(result.in).toBeCloseTo(12, 0)  // ~5'0"
    })
  })

  describe('ftInToCm', () => {
    it('converts 5ft 7in correctly', () => {
      expect(ftInToCm(5, 7)).toBeCloseTo(170, 0)
    })
    it('converts 6ft 0in correctly', () => {
      expect(ftInToCm(6, 0)).toBeCloseTo(183, 0)
    })
    it('round-trips with cmToFtIn', () => {
      const originalCm = 175
      const { ft, in: inches } = cmToFtIn(originalCm)
      const backToCm = ftInToCm(ft, inches)
      expect(backToCm).toBeCloseTo(originalCm, 0)
    })
  })

  describe('formatHeight', () => {
    it('formats cm correctly', () => {
      expect(formatHeight(170, 'cm')).toBe('170 cm')
    })
    it('formats ft correctly', () => {
      const result = formatHeight(170, 'ft')
      expect(result).toMatch(/5'\d+"/)
    })
  })

  describe('formatWeight', () => {
    it('formats kg correctly', () => {
      expect(formatWeight(70, 'kg')).toBe('70 kg')
    })
    it('formats lbs correctly', () => {
      const result = formatWeight(70, 'lbs')
      expect(result).toMatch(/[\d.]+ lbs/)
    })
  })
})

describe('Calorie Calculations', () => {
  describe('calculateCalories', () => {
    it('returns a number greater than 0 for valid inputs', () => {
      const result = calculateCalories('bench-press', 'strength', 70, 3, 10)
      expect(result).toBeGreaterThan(0)
    })
    it('uses MET formula: MET * weight * duration', () => {
      // bench-press MET = 5.0, strength = 4 sec/rep
      // 3 sets * 10 reps * 4 sec = 120 sec = 0.0333 hours
      // 5.0 * 70 * 0.0333 = 11.67 → rounds to 12
      const result = calculateCalories('bench-press', 'strength', 70, 3, 10)
      expect(result).toBe(12)
    })
    it('uses fallback MET of 4.0 for unknown exercise', () => {
      const result = calculateCalories('unknown-exercise', 'strength', 70, 3, 10)
      // 4.0 * 70 * (120/3600) = 9.33 → 9
      expect(result).toBe(9)
    })
    it('cardio exercises use 3 sec/rep', () => {
      // jump-rope MET = 12.3, cardio = 3 sec/rep
      // 3 sets * 30 reps * 3 sec = 270 sec = 0.075 hours
      // 12.3 * 70 * 0.075 = 64.575 → 65
      const result = calculateCalories('jump-rope', 'cardio', 70, 3, 30)
      expect(result).toBe(65)
    })
    it('scales with body weight', () => {
      const light = calculateCalories('bench-press', 'strength', 50, 3, 10)
      const heavy = calculateCalories('bench-press', 'strength', 100, 3, 10)
      // Due to rounding, heavy may not be exactly 2x light, but should be close
      expect(heavy).toBeCloseTo(light * 2, -1)
      expect(heavy).toBeGreaterThan(light)
    })
    it('returns 0 for 0 sets or 0 reps', () => {
      expect(calculateCalories('bench-press', 'strength', 70, 0, 10)).toBe(0)
      expect(calculateCalories('bench-press', 'strength', 70, 3, 0)).toBe(0)
    })
  })

  describe('calculateCaloriesFallback', () => {
    it('multiplies calories per rep by sets and reps', () => {
      expect(calculateCaloriesFallback(5, 3, 10)).toBe(150)
    })
    it('returns 0 for 0 inputs', () => {
      expect(calculateCaloriesFallback(5, 0, 10)).toBe(0)
    })
  })
})
