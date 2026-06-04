import { confusionMatrix, winnerDistribution, idealProfileFor } from '@/engine/diagnostics'
import { DEFAULT_CONFIG, PHASE_ORDER } from '@/data/defaultConfig'

describe('confusionMatrix', () => {
  const cm = confusionMatrix(DEFAULT_CONFIG)

  it('scores every phase ideal profile at 100% on its own phase', () => {
    for (const row of cm.rows) expect(row.ownFit).toBe(100)
  })

  it('discriminates: every archetype ranks its own phase #1 with a positive margin', () => {
    expect(cm.diagonalHits).toBe(6)
    expect(cm.minMargin).toBeGreaterThan(0)
    for (const row of cm.rows) expect(row.diagonalIsTop).toBe(true)
  })

  it('idealProfileFor returns the phase target vector', () => {
    const ideal = idealProfileFor('Creativity', DEFAULT_CONFIG)
    expect(ideal.innovative_structured).toBe(DEFAULT_CONFIG.phases.Creativity.dimensions.innovative_structured.target)
  })
})

describe('winnerDistribution', () => {
  it('is deterministic for a fixed seed', () => {
    const a = winnerDistribution(DEFAULT_CONFIG, 500, 999)
    const b = winnerDistribution(DEFAULT_CONFIG, 500, 999)
    expect(a.counts).toEqual(b.counts)
  })

  it('counts sum to n', () => {
    const wd = winnerDistribution(DEFAULT_CONFIG, 1000, 42)
    const sum = PHASE_ORDER.reduce((s, p) => s + wd.counts[p], 0)
    expect(sum).toBe(1000)
  })

  it('shows no single phase dominating random profiles under current defaults (<60%)', () => {
    const wd = winnerDistribution(DEFAULT_CONFIG, 2000, 12345)
    expect(wd.topShare).toBeLessThan(60)
  })
})
