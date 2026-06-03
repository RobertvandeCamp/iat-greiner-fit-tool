import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { computeAllPhases } from '@/engine/scoringEngine'
import { PHASE_ORDER } from '@/data/defaultConfig'
import { useConfig } from '@/config/ConfigContext'
import { DIMENSIONS } from '@/data/dimensions'
import { ClassificationBadge } from '@/components/ClassificationBadge'
import type { DimensionScore, DimensionId } from '@/types/greiner'

interface WorkedExampleProps {
  scores: Record<string, DimensionScore>
}

export function WorkedExample({ scores }: WorkedExampleProps) {
  const { config } = useConfig()
  const [open, setOpen] = useState(false)
  const allZero = Object.values(scores).every((v) => v === 0)

  const result = useMemo(() => {
    if (allZero) return null
    const results = computeAllPhases(scores as Record<DimensionId, DimensionScore>, config, PHASE_ORDER)
    return [...results].sort((a, b) => b.fitPercent - a.fitPercent)[0]
  }, [scores, allZero, config])

  if (!result) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          Enter scores in the Score Input tab to see a full worked calculation here.
        </CardContent>
      </Card>
    )
  }

  const active = result.dimensionDetails.filter((d) => d.weight > 0)
  const sumWeightedFit = active.reduce((s, d) => s + d.contribution, 0)
  const sumWeights = active.reduce((s, d) => s + d.weight, 0)
  const raw = sumWeights > 0 ? sumWeightedFit / sumWeights : 0

  return (
    <Card className="border-primary/30">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer flex flex-row items-center justify-between py-3 px-6">
            <span className="font-medium text-base">
              {open ? 'Hide worked example' : `Show worked example: ${result.phaseName} (best fit)`}
            </span>
            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 px-6 pb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-1">Dimension</th>
                  <th className="text-right py-1">Score</th>
                  <th className="text-right py-1">Target</th>
                  <th className="text-right py-1">Weight</th>
                  <th className="text-right py-1">Fit</th>
                  <th className="text-right py-1">Contribution</th>
                </tr>
              </thead>
              <tbody>
                {result.dimensionDetails.map((detail) => {
                  const dim = DIMENSIONS.find((d) => d.id === detail.dimensionId)
                  return (
                    <tr
                      key={detail.dimensionId}
                      className={cn('border-b border-border last:border-0', detail.weight === 0 && 'text-muted-foreground')}
                    >
                      <td className="py-1.5 pr-2">{dim?.shortLabel ?? detail.dimensionId}</td>
                      <td className="text-right py-1.5">{detail.candidateScore}</td>
                      <td className="text-right py-1.5">{detail.target}</td>
                      <td className="text-right py-1.5">{detail.weight}</td>
                      <td className="text-right py-1.5">{detail.fit.toFixed(3)}</td>
                      <td className="text-right py-1.5">{detail.contribution.toFixed(3)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="mt-4 pt-4 border-t border-border text-sm space-y-1">
              <p><span className="text-muted-foreground">&Sigma; weighted fit:</span> {sumWeightedFit.toFixed(3)}</p>
              <p><span className="text-muted-foreground">&Sigma; weights:</span> {sumWeights}</p>
              <p><span className="text-muted-foreground">Raw ratio:</span> {sumWeightedFit.toFixed(3)} / {sumWeights} = {raw.toFixed(4)}</p>
              <p><span className="text-muted-foreground">Floor:</span> {result.floor.toFixed(4)}</p>
              <p><span className="text-muted-foreground">Fit%:</span> {result.fitPercent}%</p>
              <div className="pt-2">
                <ClassificationBadge fitPercent={result.fitPercent} classification={result.classification} />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
