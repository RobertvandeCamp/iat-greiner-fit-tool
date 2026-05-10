import { useMemo } from 'react'
import { computeAllPhases } from '@/engine/scoringEngine'
import { PHASE_NORMS } from '@/data/phaseNorms'
import { SCALING_PARAMS } from '@/data/scalingParams'
import { REFERENCE_CANDIDATES } from '@/data/referenceCandidates'
import { CandidateValidation } from '@/components/CandidateValidation'

export function ValidationPanel() {
  const candidateResults = useMemo(
    () =>
      REFERENCE_CANDIDATES.map((candidate) => {
        const results = computeAllPhases(candidate.scores, PHASE_NORMS, SCALING_PARAMS)
        const expectedOrder = [...candidate.expectedRankings]
          .sort((a, b) => a.rank - b.rank)
          .map((e) => e.phaseId)
        const computedOrder = results.map((r) => r.phaseId)
        const passed = expectedOrder.every((id, i) => id === computedOrder[i])
        return { candidate, results, passed }
      }),
    []
  )

  const passedCount = candidateResults.filter((r) => r.passed).length

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Validation</h2>

      {passedCount === 3 ? (
        <div className="rounded px-4 py-2 text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          All 3 reference candidates passed validation.
        </div>
      ) : (
        <div className="rounded px-4 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          {3 - passedCount} reference candidate(s) failed validation.
        </div>
      )}

      <div className="space-y-3">
        {candidateResults.map(({ candidate, results, passed }) => (
          <CandidateValidation
            key={candidate.id}
            candidate={candidate}
            results={results}
            passed={passed}
          />
        ))}
      </div>
    </div>
  )
}
