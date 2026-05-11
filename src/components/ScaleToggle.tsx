import { Switch } from '@/components/ui/switch'

export interface ScaleToggleProps {
  scale: '7pt' | '3pt'
  onScaleChange: (scale: '7pt' | '3pt') => void
}

export function ScaleToggle({ scale, onScaleChange }: ScaleToggleProps) {
  const is7pt = scale === '7pt'

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm ${!is7pt ? 'text-foreground' : 'text-muted-foreground'}`}>
        -3 / +3
      </span>
      <Switch
        checked={is7pt}
        onCheckedChange={(checked) => onScaleChange(checked ? '7pt' : '3pt')}
      />
      <span className={`text-sm ${is7pt ? 'text-foreground' : 'text-muted-foreground'}`}>
        1 — 7
      </span>
    </div>
  )
}
