import { useState } from 'react'
import { DimensionSlider } from '@/components/DimensionSlider'
import { ScaleToggle } from '@/components/ScaleToggle'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DIMENSIONS } from '@/data/dimensions'
import type { DimensionScore } from '@/types/greiner'

interface ScoreInputFormProps {
  scores: Record<string, DimensionScore>
  onScoresChange: (scores: Record<string, DimensionScore>) => void
}

export function ScoreInputForm({ scores, onScoresChange }: ScoreInputFormProps) {
  const [scale, setScale] = useState<'7pt' | '3pt'>('7pt')

  function handleScoreChange(dimensionId: string, value: DimensionScore) {
    onScoresChange({ ...scores, [dimensionId]: value })
  }

  function resetNeutral() {
    onScoresChange(
      Object.fromEntries(Object.keys(scores).map((k) => [k, 0 as DimensionScore])) as Record<string, DimensionScore>,
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        Enter the candidate&apos;s Reveal-14 dimension scores below, each from one pole (e.g. Analytical)
        to the opposite (e.g. Intuitive). The 7-point view shows 1&ndash;7 (4 = neutral); the signed view
        shows &minus;3&hellip;+3. The test&apos;s 1&ndash;7 score maps to the signed axis via score &minus; 4.
      </p>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <ScaleToggle scale={scale} onScaleChange={setScale} />
            <button
              className="text-sm px-3 py-1.5 rounded border border-input bg-background hover:bg-muted transition-colors"
              onClick={resetNeutral}
            >
              Reset to neutral
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-0">
          {DIMENSIONS.map((dim, index) => (
            <div
              key={dim.id}
              className={index < DIMENSIONS.length - 1 ? 'border-b border-border py-3' : 'py-3'}
            >
              <DimensionSlider
                dimension={dim}
                value={scores[dim.id]}
                scale={scale}
                onChange={handleScoreChange}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
