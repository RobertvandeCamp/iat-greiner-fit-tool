import { useState } from 'react'
import { DimensionSlider } from '@/components/DimensionSlider'
import { ScaleToggle } from '@/components/ScaleToggle'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DIMENSIONS } from '@/data/dimensions'
import { REFERENCE_CANDIDATES } from '@/data/referenceCandidates'
import type { DimensionScore } from '@/types/greiner'

interface ScoreInputFormProps {
  scores: Record<string, DimensionScore>
  onScoresChange: (scores: Record<string, DimensionScore>) => void
  preset: string
  onPresetChange: (preset: string) => void
}

export function ScoreInputForm({ scores, onScoresChange, preset, onPresetChange }: ScoreInputFormProps) {
  const [scale, setScale] = useState<'7pt' | '3pt'>('7pt')

  function handleScoreChange(dimensionId: string, value: DimensionScore) {
    const updated = { ...scores, [dimensionId]: value }
    onScoresChange(updated)
    onPresetChange('custom')
  }

  function handlePresetChange(presetId: string) {
    if (presetId === 'custom') {
      const reset = Object.fromEntries(
        Object.keys(scores).map((k) => [k, 0 as DimensionScore])
      ) as Record<string, DimensionScore>
      onScoresChange(reset)
      onPresetChange('custom')
    } else {
      const candidate = REFERENCE_CANDIDATES.find((c) => c.id === presetId)
      if (candidate) {
        onScoresChange({ ...candidate.scores } as Record<string, DimensionScore>)
        onPresetChange(presetId)
      }
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        Enter the candidate&apos;s Reveal-14 IAT dimension scores below. These scores measure implicit
        personality associations across 14 trait dimensions, ranging from one pole (e.g. Analytical)
        to the opposite (e.g. Intuitive). Load a reference candidate preset to see example data,
        or enter scores manually.
      </p>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <ScaleToggle scale={scale} onScaleChange={setScale} />
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select candidate..." />
            </SelectTrigger>
            <SelectContent>
              {REFERENCE_CANDIDATES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        {DIMENSIONS.map((dim, index) => (
          <div
            key={dim.id}
            className={
              index < DIMENSIONS.length - 1
                ? 'border-b border-border py-3'
                : 'py-3'
            }
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
