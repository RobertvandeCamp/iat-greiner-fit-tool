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
  onScoresChange?: (scores: Record<string, DimensionScore>) => void
}

const neutralScores: Record<string, DimensionScore> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, 0 as DimensionScore])
)

export function ScoreInputForm({ onScoresChange }: ScoreInputFormProps) {
  const [scores, setScores] = useState<Record<string, DimensionScore>>(neutralScores)
  const [scale, setScale] = useState<'7pt' | '3pt'>('7pt')
  const [preset, setPreset] = useState<string>('custom')

  function handleScoreChange(dimensionId: string, value: DimensionScore) {
    const updated = { ...scores, [dimensionId]: value }
    setScores(updated)
    setPreset('custom')
    onScoresChange?.(updated)
  }

  function handlePresetChange(presetId: string) {
    if (presetId === 'custom') {
      setScores({ ...neutralScores })
      setPreset('custom')
      onScoresChange?.({ ...neutralScores })
    } else {
      const candidate = REFERENCE_CANDIDATES.find((c) => c.id === presetId)
      if (candidate) {
        const newScores = { ...candidate.scores } as Record<string, DimensionScore>
        setScores(newScores)
        setPreset(presetId)
        onScoresChange?.(newScores)
      }
    }
  }

  return (
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
  )
}
