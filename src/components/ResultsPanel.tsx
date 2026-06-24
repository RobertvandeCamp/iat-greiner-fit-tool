import { useMemo, useState } from 'react'
import { computeAllPhases } from '@/engine/scoringEngine'
import { PHASE_ORDER } from '@/data/defaultConfig'
import { useConfig } from '@/config/ConfigContext'
import { PhaseRankingChart } from '@/components/PhaseRankingChart'
import { PhaseCard } from '@/components/PhaseCard'
import { ClassificationBadge } from '@/components/ClassificationBadge'
import { ScoringHelp } from '@/components/ScoringHelp'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { DimensionScore, DimensionId, GreinerPhase } from '@/types/greiner'

interface ResultsPanelProps {
  scores: Record<string, DimensionScore>
}

export function ResultsPanel({ scores }: ResultsPanelProps) {
  const { config } = useConfig()
  const [targetPhase, setTargetPhase] = useState<GreinerPhase | 'none'>('none')
  const allZero = Object.values(scores).every((v) => v === 0)

  const results = useMemo(
    () => computeAllPhases(scores as Record<DimensionId, DimensionScore>, config, PHASE_ORDER),
    [scores, config]
  )

  const ranked = useMemo(
    () => [...results].sort((a, b) => b.fitPercent - a.fitPercent),
    [results]
  )

  const target = targetPhase === 'none' ? null : results.find((r) => r.phaseId === targetPhase) ?? null
  const tiedForTop = ranked.filter((r) => r.fitPercent === ranked[0].fitPercent)

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
          Each Greiner growth phase demands a different leadership personality. The fit percentage shows
          how closely this profile matches each phase&apos;s ideal. Pick a target phase to assess fit to
          the org&apos;s current phase, or read the ranking to see where the person fits best.
        </p>
      </div>

      <ScoringHelp />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Best fit:</span>
        <span className="text-sm">
          {tiedForTop.length > 1
            ? `Tie: ${tiedForTop.map((r) => r.phaseName).join(', ')}`
            : ranked[0].phaseName}
        </span>
        <ClassificationBadge fitPercent={ranked[0].fitPercent} classification={ranked[0].classification} />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Target phase:</span>
          <Select value={targetPhase} onValueChange={(v) => setTargetPhase(v as GreinerPhase | 'none')}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {PHASE_ORDER.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {target && (
        <div className="rounded-lg border border-primary/40 bg-primary/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fit to target phase</p>
              <p className="font-medium">{target.phaseName}{target.extrapolated ? ' (extrapolated)' : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold tabular-nums">{target.fitPercent}%</span>
              <ClassificationBadge fitPercent={target.fitPercent} classification={target.classification} />
            </div>
          </div>
          {target.criticalMismatches.length > 0 && (
            <p className="text-xs text-amber-700 mt-2">
              ⚠ Opposite of phase demand on {target.criticalMismatches.length} critical dimension(s).
            </p>
          )}
        </div>
      )}

      <div className="hidden sm:block">
        <PhaseRankingChart results={ranked} />
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <PhaseCard
            key={result.phaseId}
            result={result}
            highlighted={result.phaseId === targetPhase}
          />
        ))}
      </div>
    </div>
  )
}
