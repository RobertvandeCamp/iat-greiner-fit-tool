import { Fragment } from 'react'
import { WorkedExample } from '@/components/WorkedExample'
import { ClassificationBadge } from '@/components/ClassificationBadge'

const THRESHOLDS: { fitPercent: number; classification: 'Strong' | 'Usable' | 'Risk' | 'Mismatch'; label: string }[] = [
  { fitPercent: 80, classification: 'Strong',   label: '>= 67%' },
  { fitPercent: 55, classification: 'Usable',   label: '>= 50%' },
  { fitPercent: 40, classification: 'Risk',      label: '>= 34%' },
  { fitPercent: 20, classification: 'Mismatch', label: '< 34%' },
]

export function FormulaPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">How Scoring Works</h2>

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
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">Step 2: Weighted Similarity</h3>
          <p className="text-sm leading-relaxed text-foreground mb-2">
            Convert distance to similarity and apply dimension weights. Only dimensions with weight &gt; 0
            contribute (Critical = 3, Supporting = 1, Neutral = 0 are excluded). The raw similarity is
            the sum of weighted similarities divided by the sum of active weights.
          </p>
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            raw_similarity = sum(weight_i * (1 - |score_i - target_i| / 6)) / sum(weight_i) where weight_i &gt; 0
          </code>
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
        </section>

        <WorkedExample />

      </div>
    </div>
  )
}
