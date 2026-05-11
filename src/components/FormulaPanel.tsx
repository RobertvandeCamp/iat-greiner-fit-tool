import { Fragment, useMemo } from 'react'
import { WorkedExample } from '@/components/WorkedExample'
import { ClassificationBadge } from '@/components/ClassificationBadge'
import { computeAllPhases } from '@/engine/scoringEngine'
import { PHASE_NORMS } from '@/data/phaseNorms'
import { SCALING_PARAMS } from '@/data/scalingParams'
import type { DimensionScore } from '@/types/greiner'

const THRESHOLDS: { fitPercent: number; classification: 'Strong' | 'Usable' | 'Risk' | 'Mismatch'; label: string }[] = [
  { fitPercent: 80, classification: 'Strong',   label: '>= 67%' },
  { fitPercent: 55, classification: 'Usable',   label: '>= 50%' },
  { fitPercent: 40, classification: 'Risk',      label: '>= 34%' },
  { fitPercent: 20, classification: 'Mismatch', label: '< 34%' },
]

interface FormulaPanelProps {
  scores: Record<string, DimensionScore>
}

export function FormulaPanel({ scores }: FormulaPanelProps) {
  const allZero = Object.values(scores).every((v) => v === 0)

  const topResult = useMemo(() => {
    if (allZero) return null
    const results = computeAllPhases(scores, PHASE_NORMS, SCALING_PARAMS)
    return results[0]
  }, [scores, allZero])

  const liveStats = useMemo(() => {
    if (!topResult) return null
    const details = topResult.dimensionDetails
    const activeDetails = details.filter(d => d.weight > 0)
    const exampleDim = activeDetails[0]
    const similaritySum = details.reduce((s, d) => s + d.similarity, 0)
    const weightSum = details.reduce((s, d) => s + d.weight, 0)
    const fitPercentRaw = SCALING_PARAMS.a * topResult.rawFit - SCALING_PARAMS.b
    return { exampleDim, similaritySum, weightSum, fitPercentRaw }
  }, [topResult])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">How Scoring Works</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1 max-w-2xl">
          For full transparency, this section explains exactly how fit percentages are calculated.
          The scoring uses weighted distance-based similarity: each Greiner phase has target scores
          and dimension weights (Critical, Supporting, or Neutral). The closer a candidate&apos;s
          IAT scores are to the phase targets on the important dimensions, the higher the fit.
        </p>
        {topResult && (
          <p className="text-sm text-primary font-medium mt-2">
            Showing live values for your best-fitting phase: {topResult.phaseName}
          </p>
        )}
      </div>

      <div className="space-y-8">

        <section>
          <h3 className="font-semibold text-base mb-2">Step 1: Raw Distance per Dimension</h3>
          <p className="text-sm leading-relaxed text-foreground mb-2">
            For each dimension, compute the absolute difference between the candidate&apos;s score and
            the phase target. Scores range from -3 to +3, so the maximum possible distance is 6.
          </p>
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            distance = |score - target|
          </code>
          {topResult && liveStats?.exampleDim && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs space-y-0.5">
              <p className="font-medium text-foreground">Your scores &mdash; {topResult.phaseName}</p>
              <p className="text-muted-foreground">
                e.g. {liveStats.exampleDim.dimensionId}: |{liveStats.exampleDim.candidateScore} &minus; ({liveStats.exampleDim.target})| = {liveStats.exampleDim.distance}
              </p>
            </div>
          )}
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">Step 2: Weighted Similarity</h3>
          <p className="text-sm leading-relaxed text-foreground mb-2">
            Convert distance to similarity and apply dimension weights. Only dimensions with weight &gt; 0
            contribute (Critical = 3, Supporting = 1, Neutral = 0 are excluded). The raw similarity is
            the sum of weighted similarities divided by the sum of active weights.
          </p>
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            raw_similarity = sum(weight_i * (1 - distance_i / 6)) / sum(weight_i)
          </code>
          {topResult && liveStats && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs space-y-0.5">
              <p className="font-medium text-foreground">Your scores &mdash; {topResult.phaseName}</p>
              <p className="text-muted-foreground">
                weighted sum = {liveStats.similaritySum.toFixed(3)}, weight sum = {liveStats.weightSum}
              </p>
              <p className="text-muted-foreground">
                raw similarity = {liveStats.similaritySum.toFixed(3)} / {liveStats.weightSum} = {topResult.rawFit.toFixed(6)}
              </p>
            </div>
          )}
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">Step 3: Linear Scaling</h3>
          <p className="text-sm leading-relaxed text-foreground mb-2">
            Scale the raw similarity (a value between 0 and 1) to a percentage using linear regression
            coefficients derived from calibration against 18 reference data points. The result is clamped
            to the 0-100 range.
          </p>
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            fit% = clamp(347.995 * raw_similarity - 217.060, 0, 100)
          </code>
          {topResult && liveStats && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs space-y-0.5">
              <p className="font-medium text-foreground">Your scores &mdash; {topResult.phaseName}</p>
              <p className="text-muted-foreground">
                347.995 &times; {topResult.rawFit.toFixed(6)} &minus; 217.060 = {liveStats.fitPercentRaw.toFixed(1)} &rarr; clamped to {topResult.fitPercent}%
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
