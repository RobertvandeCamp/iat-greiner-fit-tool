import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useConfig } from '@/config/ConfigContext'
import { bandTextClass } from '@/lib/bandColor'
import type { Classification } from '@/types/greiner'

interface ClassificationBadgeProps {
  fitPercent: number
  classification: Classification
}

export function ClassificationBadge({ fitPercent, classification }: ClassificationBadgeProps) {
  const { config } = useConfig()
  return (
    <Badge variant="outline" className={cn(bandTextClass(fitPercent, config.bands))} role="status">
      {fitPercent}% {classification}
    </Badge>
  )
}
