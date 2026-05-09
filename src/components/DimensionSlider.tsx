import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import type { DimensionDef, DimensionScore } from '@/types/greiner'

export interface DimensionSliderProps {
  dimension: DimensionDef
  value: DimensionScore
  scale: '7pt' | '3pt'
  onChange: (dimensionId: string, value: DimensionScore) => void
}

function formatDisplayValue(value: DimensionScore, scale: '7pt' | '3pt'): string {
  if (scale === '7pt') {
    return String(value + 4)
  }
  if (value > 0) return `+${value}`
  return String(value)
}

export function DimensionSlider({ dimension, value, scale, onChange }: DimensionSliderProps) {
  const displayValue = formatDisplayValue(value, scale)
  const badgeVariant = value === 0 ? 'secondary' : 'default'

  return (
    <div className="flex w-full items-center gap-2">
      <span className="text-sm text-muted-foreground text-right w-40 shrink-0">
        {dimension.leftTrait}
      </span>
      <Slider
        className="flex-1"
        min={-3}
        max={3}
        step={1}
        value={[value]}
        onValueChange={(newValue) => onChange(dimension.id, newValue[0] as DimensionScore)}
      />
      <span className="text-sm text-muted-foreground w-40 shrink-0">
        {dimension.rightTrait}
      </span>
      <Badge variant={badgeVariant} className="w-10 justify-center">
        {displayValue}
      </Badge>
    </div>
  )
}
