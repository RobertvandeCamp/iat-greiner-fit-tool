import { useMemo } from 'react'
import { computeAllPhases } from '@/engine/scoringEngine'
import { PHASE_NORMS } from '@/data/phaseNorms'
import { SCALING_PARAMS } from '@/data/scalingParams'
import { PhaseRankingChart } from '@/components/PhaseRankingChart'
import { PhaseCard } from '@/components/PhaseCard'
import type { DimensionScore } from '@/types/greiner'

interface ResultsPanelProps {
  scores: Record<string, DimensionScore>
}

export function ResultsPanel({ scores }: ResultsPanelProps) {
  const allZero = Object.values(scores).every((v) => v === 0)

  const results = useMemo(
    () => computeAllPhases(scores, PHASE_NORMS, SCALING_PARAMS),
    [scores]
  )

  if (allZero) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No scores entered yet</h2>
        <p className="text-muted-foreground">
          Set dimension scores in the Score Input tab to see phase fit rankings.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Phase Fit Results</h2>

      {/* Chart: hidden on mobile, visible sm+ */}
      <div className="hidden sm:block">
        <PhaseRankingChart results={results} />
      </div>

      {/* Phase cards */}
      <div className="space-y-3">
        {results.map((result) => (
          <PhaseCard key={result.phaseId} result={result} />
        ))}
      </div>
    </div>
  )
}
