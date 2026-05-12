import { useMemo } from 'react'
import { computeAllPhases } from '@/engine/scoringEngine'
import { PHASE_NORMS } from '@/data/phaseNorms'
import { PhaseRankingChart } from '@/components/PhaseRankingChart'
import { PhaseCard } from '@/components/PhaseCard'
import type { DimensionScore, DimensionId } from '@/types/greiner'

interface ResultsPanelProps {
  scores: Record<string, DimensionScore>
}

export function ResultsPanel({ scores }: ResultsPanelProps) {
  const allZero = Object.values(scores).every((v) => v === 0)

  const results = useMemo(
    () => computeAllPhases(scores as Record<DimensionId, DimensionScore>, PHASE_NORMS),
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
      <div>
        <h2 className="text-xl font-semibold">Phase Fit Results</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1 max-w-2xl">
          Each of Greiner&apos;s six growth phases demands a different leadership personality.
          The fit percentage shows how closely the candidate&apos;s IAT profile matches the ideal
          personality for each phase &mdash; from Creativity (startup agility) through Alliances
          (external partnerships). Expand a phase card to see which dimensions drive the score.
        </p>
      </div>

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
