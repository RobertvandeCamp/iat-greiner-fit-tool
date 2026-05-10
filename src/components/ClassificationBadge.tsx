import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Classification } from '@/types/greiner'

interface ClassificationBadgeProps {
  fitPercent: number
  classification: Classification
}

const BADGE_CLASSES: Record<Classification, string> = {
  Strong: 'bg-green-100 text-green-800 border-green-200',
  Usable: 'bg-blue-100 text-blue-800 border-blue-200',
  Risk: 'bg-amber-100 text-amber-800 border-amber-200',
  Mismatch: 'bg-red-100 text-red-800 border-red-200',
}

export function ClassificationBadge({ fitPercent, classification }: ClassificationBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(BADGE_CLASSES[classification])}
      role="status"
    >
      {fitPercent}% {classification}
    </Badge>
  )
}
