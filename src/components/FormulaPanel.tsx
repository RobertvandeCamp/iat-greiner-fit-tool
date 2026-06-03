import { useMemo } from 'react'
import { WorkedExample } from '@/components/WorkedExample'
import { ClassificationBadge } from '@/components/ClassificationBadge'
import { computeAllPhases } from '@/engine/scoringEngine'
import { PHASE_ORDER } from '@/data/defaultConfig'
import { useConfig } from '@/config/ConfigContext'
import type { DimensionScore, DimensionId } from '@/types/greiner'

interface FormulaPanelProps {
  scores: Record<string, DimensionScore>
}

const code = 'block text-xs font-mono bg-muted px-1.5 py-0.5 rounded'

export function FormulaPanel({ scores }: FormulaPanelProps) {
  const { config } = useConfig()
  const allZero = Object.values(scores).every((v) => v === 0)

  const topResult = useMemo(() => {
    if (allZero) return null
    const results = computeAllPhases(scores as Record<DimensionId, DimensionScore>, config, PHASE_ORDER)
    return [...results].sort((a, b) => b.fitPercent - a.fitPercent)[0]
  }, [scores, allZero, config])

  const liveStats = useMemo(() => {
    if (!topResult) return null
    const active = topResult.dimensionDetails.filter((d) => d.weight > 0)
    const sumWeightedFit = active.reduce((s, d) => s + d.contribution, 0)
    const sumWeights = active.reduce((s, d) => s + d.weight, 0)
    const raw = sumWeights > 0 ? sumWeightedFit / sumWeights : 0
    return { example: active[0], sumWeightedFit, sumWeights, raw }
  }, [topResult])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">How Scoring Works</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1 max-w-2xl">
          The model scores demands&ndash;abilities fit: each phase defines a target pole and weight per
          dimension. Per-dimension fit is a transparent distance-to-target, aggregated as a weighted mean
          and normalized to a percentage. All parameters are editable in Model Configuration.
        </p>
        {topResult && (
          <p className="text-sm text-primary font-medium mt-2">
            Showing live values for the best-fitting phase: {topResult.phaseName}
          </p>
        )}
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="font-semibold text-base mb-2">Step 1: Per-dimension fit (distance to target)</h3>
          <p className="text-sm leading-relaxed mb-2">
            For each dimension, measure how close the candidate score <code>s</code> is to the phase
            target <code>t</code> on the 6-point span. Optionally subtract a wrong-pole penalty when the
            candidate sits on the opposite pole.
          </p>
          <code className={code}>g = 1 &minus; |s &minus; t| / 6</code>
          <code className={code}>if penalty &gt; 0 and opposite pole: g = g &minus; penalty &times; (wrongPoleAmount / 3)</code>
          {liveStats?.example && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              e.g. {liveStats.example.dimensionId}: s={liveStats.example.candidateScore}, t={liveStats.example.target} &rarr; fit = {liveStats.example.fit.toFixed(3)}
            </div>
          )}
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">Step 2: Weighted mean (active dimensions)</h3>
          <p className="text-sm leading-relaxed mb-2">
            Weight each fit by its tier (Critical = 3, Supporting = 1). Neutral dimensions (0) are
            excluded from both the sum and the divisor.
          </p>
          <code className={code}>raw = &Sigma;(weight &times; fit) / &Sigma; weight</code>
          {liveStats && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              raw = {liveStats.sumWeightedFit.toFixed(3)} / {liveStats.sumWeights} = {liveStats.raw.toFixed(4)}
            </div>
          )}
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">Step 3: Normalize to a percentage</h3>
          <p className="text-sm leading-relaxed mb-2">
            With floor normalization on, rescale against the phase&apos;s theoretical worst case so 0% =
            maximally opposed, 100% = exact target. Off = raw &times; 100.
          </p>
          <code className={code}>fit% = clamp((raw &minus; floor) / (1 &minus; floor) &times; 100, 0, 100)</code>
          {topResult && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              floor = {topResult.floor.toFixed(4)} &rarr; fit% = {topResult.fitPercent}%
            </div>
          )}
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">Step 4: Classification</h3>
          <p className="text-sm leading-relaxed mb-2">The fit % is labelled using the configurable bands:</p>
          <div className="grid grid-cols-2 gap-2 mt-2 max-w-xs">
            {[...config.bands].sort((a, b) => b.min - a.min).map((b, i) => (
              <div key={i} className="contents">
                <div><ClassificationBadge fitPercent={b.min + 1} classification={b.label} /></div>
                <div className="text-sm self-center">&ge; {b.min}%</div>
              </div>
            ))}
          </div>
          {topResult && (
            <div className="mt-3 rounded border border-border bg-muted/50 px-3 py-2 text-xs flex items-center gap-2 text-muted-foreground">
              {topResult.fitPercent}% &rarr; <ClassificationBadge fitPercent={topResult.fitPercent} classification={topResult.classification} />
            </div>
          )}
        </section>

        <WorkedExample scores={scores} />
      </div>
    </div>
  )
}
