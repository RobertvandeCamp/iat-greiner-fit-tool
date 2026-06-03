import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Classification } from '@/types/greiner'

interface ClassificationBadgeProps {
  fitPercent: number
  classification: Classification
}

/** Colour by percentage band, independent of the (configurable) label text. */
function colorFor(fitPercent: number): string {
  if (fitPercent >= 75) return 'bg-green-100 text-green-800 border-green-200'
  if (fitPercent >= 55) return 'bg-blue-100 text-blue-800 border-blue-200'
  if (fitPercent >= 40) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

export function ClassificationBadge({ fitPercent, classification }: ClassificationBadgeProps) {
  return (
    <Badge variant="outline" className={cn(colorFor(fitPercent))} role="status">
      {fitPercent}% {classification}
    </Badge>
  )
}
