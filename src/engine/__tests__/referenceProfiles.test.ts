import { computeAllPhases } from '@/engine/scoringEngine'
import { DEFAULT_CONFIG, PHASE_ORDER } from '@/data/defaultConfig'
import { REFERENCE_PROFILES } from '@/data/referenceProfiles'
import type { GreinerPhase } from '@/types/greiner'

/**
 * Reference-profile behaviour under the CURRENT (uncalibrated) literature defaults.
 *
 * These document the three example candidates' phase rankings as the model
 * scores them today. They are a calibration tripwire: once Marco tunes the
 * per-phase targets/weights (Phase 56), these expectations are EXPECTED to
 * change and should be updated to match the agreed calibration.
 *
 * Observation captured here: all three currently rank Creativity #1 — a sign the
 * default Creativity profile may be too easy to satisfy and a prime calibration target.
 */

function ranking(id: string): { order: GreinerPhase[]; pct: Record<GreinerPhase, number> } {
  const profile = REFERENCE_PROFILES.find((p) => p.id === id)!
  const results = computeAllPhases(profile.scores, DEFAULT_CONFIG, PHASE_ORDER)
  const sorted = [...results].sort((a, b) => b.fitPercent - a.fitPercent)
  const pct = {} as Record<GreinerPhase, number>
  for (const r of results) pct[r.phaseId] = r.fitPercent
  return { order: sorted.map((r) => r.phaseId), pct }
}

describe('reference profile K1 · N.W. (uncalibrated defaults)', () => {
  const { order, pct } = ranking('K1')
  it('ranks phases Creativity > Collaboration > Alliances > Delegation > Direction > Coordination', () => {
    expect(order).toEqual([
      'Creativity', 'Collaboration', 'Alliances', 'Delegation', 'Direction', 'Coordination',
    ])
  })
  it('has the expected fit percentages', () => {
    expect(pct).toEqual({
      Creativity: 77, Collaboration: 72, Alliances: 69, Delegation: 56, Direction: 48, Coordination: 34,
    })
  })
})

describe('reference profile K2 · K.D. (uncalibrated defaults)', () => {
  const { order, pct } = ranking('K2')
  it('ranks phases Creativity > Alliances > Collaboration > Direction > Delegation > Coordination', () => {
    expect(order).toEqual([
      'Creativity', 'Alliances', 'Collaboration', 'Direction', 'Delegation', 'Coordination',
    ])
  })
  it('has the expected fit percentages', () => {
    expect(pct).toEqual({
      Creativity: 72, Alliances: 71, Collaboration: 65, Direction: 60, Delegation: 56, Coordination: 47,
    })
  })
})

describe('reference profile K3 · M.A. (uncalibrated defaults)', () => {
  const { order, pct } = ranking('K3')
  it('ranks phases Creativity > Delegation > Direction > Collaboration > Coordination > Alliances', () => {
    expect(order).toEqual([
      'Creativity', 'Delegation', 'Direction', 'Collaboration', 'Coordination', 'Alliances',
    ])
  })
  it('has the expected fit percentages', () => {
    expect(pct).toEqual({
      Creativity: 74, Delegation: 68, Direction: 66, Collaboration: 55, Coordination: 47, Alliances: 45,
    })
  })
})

describe('reference profiles — cross-cutting observation', () => {
  it('all three currently rank Creativity first (uncalibrated — expected to change after calibration)', () => {
    for (const p of REFERENCE_PROFILES) {
      expect(ranking(p.id).order[0]).toBe('Creativity')
    }
  })
})
