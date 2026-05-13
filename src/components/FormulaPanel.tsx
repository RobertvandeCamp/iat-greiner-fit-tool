import { Fragment, useMemo } from 'react'
import { WorkedExample } from '@/components/WorkedExample'
import { ClassificationBadge } from '@/components/ClassificationBadge'
import { computeAllPhases } from '@/engine/scoringEngine'
import { PHASE_NORMS } from '@/data/phaseNorms'
import type { DimensionScore, DimensionId, Classification } from '@/types/greiner'

const THRESHOLDS: { fitPercent: number; classification: Classification; label: string }[] = [
  { fitPercent: 80, classification: 'Sterke fit', label: '>= 75%' },
  { fitPercent: 60, classification: 'Goede fit',  label: '>= 55%' },
  { fitPercent: 45, classification: 'Risicofit',  label: '>= 40%' },
  { fitPercent: 20, classification: 'Mismatch',   label: '< 40%' },
]

interface FormulaPanelProps {
  scores: Record<string, DimensionScore>
}

export function FormulaPanel({ scores }: FormulaPanelProps) {
  const allZero = Object.values(scores).every((v) => v === 0)

  const topResult = useMemo(() => {
    if (allZero) return null
    const results = computeAllPhases(scores as Record<DimensionId, DimensionScore>, PHASE_NORMS)
    return [...results].sort((a, b) => b.fitPercent - a.fitPercent)[0]
  }, [scores, allZero])

  const liveStats = useMemo(() => {
    if (!topResult) return null
    const details = topResult.dimensionDetails
    const activeDetails = details.filter(d => d.importance > 0)
    const exampleDim = activeDetails[0]
    const sumContributions = details.reduce((s, d) => s + d.contribution, 0)
    const sumImportances = details.reduce((s, d) => s + d.importance, 0)
    return { exampleDim, sumContributions, sumImportances }
  }, [topResult])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">How Scoring Works</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1 max-w-2xl">
          For full transparency, this section explains how fit percentages are calculated.
          The v2 scoring uses direction-based alignment: each Greiner phase specifies a target
          direction (-1, 0, or +1) and importance weight for every dimension. The closer a
          candidate scores to the target direction with higher importance, the higher the fit.
        </p>
        {topResult && (
          <p className="text-sm text-primary font-medium mt-2">
            Showing live values for your best-fitting phase: {topResult.phaseName}
          </p>
        )}
      </div>

      <div className="space-y-8">

        <section>
          <h3 className="font-semibold text-base mb-2">Step 1: Alignment per Dimension</h3>
          <p className="text-sm leading-relaxed text-foreground mb-2">
            For each dimension, compute how aligned the candidate&apos;s score is with the phase target
            direction. When the target is non-zero, alignment is linear from 0 to 1.
            When the target is 0 (midpoint preferred), perfect score is 0, worst is ±3.
          </p>
          <div className="space-y-1">
            <code className="block text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
              if target &ne; 0: alignment = (score &times; target + 3) / 6
            </code>
            <code className="block text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
              if target = 0: alignment = 1 &minus; |score| / 3
            </code>
          </div>
          {topResult && liveStats?.exampleDim && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs space-y-0.5">
              <p className="font-medium text-foreground">Your scores &mdash; {topResult.phaseName}</p>
              <p className="text-muted-foreground">
                e.g. {liveStats.exampleDim.dimensionId}: score={liveStats.exampleDim.candidateScore}, target={liveStats.exampleDim.target}
                {' '}&rarr; alignment = {liveStats.exampleDim.alignment.toFixed(3)}
              </p>
            </div>
          )}
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">Step 2: Weighted Contribution</h3>
          <p className="text-sm leading-relaxed text-foreground mb-2">
            Multiply alignment by the dimension&apos;s importance (|numeric weight|). Neutral dimensions
            (importance = 0) contribute nothing. Sum all contributions and all importances.
          </p>
          <div className="space-y-1">
            <code className="block text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
              contribution = importance &times; alignment &nbsp;(0 if importance = 0)
            </code>
            <code className="block text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
              raw ratio = sum(contributions) / sum(importances)
            </code>
          </div>
          {topResult && liveStats && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs space-y-0.5">
              <p className="font-medium text-foreground">Your scores &mdash; {topResult.phaseName}</p>
              <p className="text-muted-foreground">
                sum contributions = {liveStats.sumContributions.toFixed(3)}, sum importances = {liveStats.sumImportances}
              </p>
              <p className="text-muted-foreground">
                raw ratio = {liveStats.sumContributions.toFixed(3)} / {liveStats.sumImportances} = {(liveStats.sumContributions / liveStats.sumImportances).toFixed(4)}
              </p>
            </div>
          )}
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">Step 3: Fit Percentage</h3>
          <p className="text-sm leading-relaxed text-foreground mb-2">
            Convert the raw ratio to a percentage. No OLS scaling — direct normalization only.
            Result is clamped to the 0-100 range.
          </p>
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            fit% = round(raw ratio &times; 100)
          </code>
          {topResult && liveStats && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs space-y-0.5">
              <p className="font-medium text-foreground">Your scores &mdash; {topResult.phaseName}</p>
              <p className="text-muted-foreground">
                round({(liveStats.sumContributions / liveStats.sumImportances).toFixed(4)} &times; 100) = {topResult.fitPercent}%
              </p>
            </div>
          )}
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">Step 4: Classification Thresholds</h3>
          <p className="text-sm leading-relaxed text-foreground mb-2">
            The final fit percentage is classified into one of four categories:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3 max-w-xs">
            {THRESHOLDS.map(({ fitPercent, classification, label }) => (
              <Fragment key={classification}>
                <div>
                  <ClassificationBadge fitPercent={fitPercent} classification={classification} />
                </div>
                <div className="text-sm self-center">
                  {label}
                </div>
              </Fragment>
            ))}
          </div>
          {topResult && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs space-y-0.5">
              <p className="font-medium text-foreground">Your scores &mdash; {topResult.phaseName}</p>
              <p className="flex items-center gap-2 text-muted-foreground">
                {topResult.fitPercent}% &rarr; <ClassificationBadge fitPercent={topResult.fitPercent} classification={topResult.classification} />
              </p>
            </div>
          )}
        </section>

        <WorkedExample scores={scores} />

      </div>
    </div>
  )
}
