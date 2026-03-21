import { describe, it, expect } from 'vitest'

// Extract BMI logic from Progress.jsx into testable pure functions
function calculateBmi(weightKg, heightCm) {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-sky-400' }
  if (bmi < 25) return { category: 'Normal', color: 'text-emerald-400' }
  if (bmi < 30) return { category: 'Overweight', color: 'text-amber-400' }
  return { category: 'Obese', color: 'text-rose-400' }
}

function getIdealWeightRange(heightCm) {
  const heightM = heightCm / 100
  return {
    low: 18.5 * heightM * heightM,
    high: 24.9 * heightM * heightM,
  }
}

// BMI scale bar position — maps BMI to 0–100% for the visual indicator
function getBmiScalePosition(bmi) {
  if (bmi <= 15) return 0
  if (bmi <= 18.5) return ((bmi - 15) / (18.5 - 15)) * 25
  if (bmi <= 25) return 25 + ((bmi - 18.5) / (25 - 18.5)) * 25
  if (bmi <= 30) return 50 + ((bmi - 25) / (30 - 25)) * 25
  if (bmi <= 40) return 75 + ((bmi - 30) / (40 - 30)) * 25
  return 100
}

describe('BMI Calculation', () => {
  it('calculates BMI correctly for 70kg, 175cm', () => {
    const bmi = calculateBmi(70, 175)
    expect(bmi).toBeCloseTo(22.86, 1)
  })

  it('calculates BMI correctly for 90kg, 170cm', () => {
    const bmi = calculateBmi(90, 170)
    expect(bmi).toBeCloseTo(31.14, 1)
  })

  it('calculates BMI correctly for 50kg, 165cm', () => {
    const bmi = calculateBmi(50, 165)
    expect(bmi).toBeCloseTo(18.37, 1)
  })
})

describe('BMI Category Classification', () => {
  it('classifies BMI < 18.5 as Underweight', () => {
    expect(getBmiCategory(17)).toEqual({ category: 'Underweight', color: 'text-sky-400' })
    expect(getBmiCategory(18.4)).toEqual({ category: 'Underweight', color: 'text-sky-400' })
  })

  it('classifies BMI 18.5–24.9 as Normal', () => {
    expect(getBmiCategory(18.5)).toEqual({ category: 'Normal', color: 'text-emerald-400' })
    expect(getBmiCategory(22)).toEqual({ category: 'Normal', color: 'text-emerald-400' })
    expect(getBmiCategory(24.9)).toEqual({ category: 'Normal', color: 'text-emerald-400' })
  })

  it('classifies BMI 25–29.9 as Overweight', () => {
    expect(getBmiCategory(25)).toEqual({ category: 'Overweight', color: 'text-amber-400' })
    expect(getBmiCategory(29.9)).toEqual({ category: 'Overweight', color: 'text-amber-400' })
  })

  it('classifies BMI >= 30 as Obese', () => {
    expect(getBmiCategory(30)).toEqual({ category: 'Obese', color: 'text-rose-400' })
    expect(getBmiCategory(40)).toEqual({ category: 'Obese', color: 'text-rose-400' })
  })

  it('handles exact boundary values correctly', () => {
    // 18.5 is Normal, not Underweight
    expect(getBmiCategory(18.5).category).toBe('Normal')
    // 25 is Overweight, not Normal
    expect(getBmiCategory(25).category).toBe('Overweight')
    // 30 is Obese, not Overweight
    expect(getBmiCategory(30).category).toBe('Obese')
  })
})

describe('Ideal Weight Range', () => {
  it('calculates ideal range for 175cm', () => {
    const range = getIdealWeightRange(175)
    expect(range.low).toBeCloseTo(56.66, 0)
    expect(range.high).toBeCloseTo(76.24, 0)
  })

  it('calculates ideal range for 160cm', () => {
    const range = getIdealWeightRange(160)
    expect(range.low).toBeCloseTo(47.36, 0)
    expect(range.high).toBeCloseTo(63.74, 0)
  })
})

describe('BMI Scale Bar Position', () => {
  it('BMI 15 maps to 0%', () => {
    expect(getBmiScalePosition(15)).toBe(0)
  })

  it('BMI below 15 maps to 0%', () => {
    expect(getBmiScalePosition(12)).toBe(0)
  })

  it('BMI 18.5 maps to 25% (underweight/normal boundary)', () => {
    expect(getBmiScalePosition(18.5)).toBeCloseTo(25, 1)
  })

  it('BMI 25 maps to 50% (normal/overweight boundary)', () => {
    expect(getBmiScalePosition(25)).toBeCloseTo(50, 1)
  })

  it('BMI 30 maps to 75% (overweight/obese boundary)', () => {
    expect(getBmiScalePosition(30)).toBeCloseTo(75, 1)
  })

  it('BMI 40 maps to 100%', () => {
    expect(getBmiScalePosition(40)).toBeCloseTo(100, 1)
  })

  it('BMI above 40 maps to 100%', () => {
    expect(getBmiScalePosition(50)).toBe(100)
  })

  it('intermediate values within underweight segment (15–18.5)', () => {
    const pos = getBmiScalePosition(16.75)
    expect(pos).toBeGreaterThan(0)
    expect(pos).toBeLessThan(25)
    expect(pos).toBeCloseTo(12.5, 1)
  })

  it('intermediate values within normal segment (18.5–25)', () => {
    const pos = getBmiScalePosition(21.75)
    expect(pos).toBeGreaterThan(25)
    expect(pos).toBeLessThan(50)
    expect(pos).toBeCloseTo(37.5, 1)
  })

  it('intermediate values within overweight segment (25–30)', () => {
    const pos = getBmiScalePosition(27.5)
    expect(pos).toBeGreaterThan(50)
    expect(pos).toBeLessThan(75)
    expect(pos).toBeCloseTo(62.5, 1)
  })

  it('intermediate values within obese segment (30–40)', () => {
    const pos = getBmiScalePosition(35)
    expect(pos).toBeGreaterThan(75)
    expect(pos).toBeLessThan(100)
    expect(pos).toBeCloseTo(87.5, 1)
  })

  it('position increases monotonically with BMI', () => {
    const bmis = [15, 16, 17, 18, 19, 22, 25, 27, 30, 35, 40]
    for (let i = 1; i < bmis.length; i++) {
      expect(getBmiScalePosition(bmis[i])).toBeGreaterThanOrEqual(getBmiScalePosition(bmis[i - 1]))
    }
  })
})
