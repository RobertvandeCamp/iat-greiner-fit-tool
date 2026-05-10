import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { computePhaseFit } from '@/engine/scoringEngine'
import { PHASE_NORMS } from '@/data/phaseNorms'
import { SCALING_PARAMS } from '@/data/scalingParams'
import { REFERENCE_CANDIDATES } from '@/data/referenceCandidates'
import { DIMENSIONS } from '@/data/dimensions'
import { ClassificationBadge } from '@/components/ClassificationBadge'

export function WorkedExample() {
  const [open, setOpen] = useState(false)

  const result = useMemo(() => {
    const k1 = REFERENCE_CANDIDATES[0]
    const creativityNorm = PHASE_NORMS.find(p => p.phaseId === 'creativity')!
    return computePhaseFit(k1.scores, creativityNorm, SCALING_PARAMS)
  }, [])

  const similaritySum = result.dimensionDetails.reduce((s, d) => s + d.similarity, 0)
  const weightSum = result.dimensionDetails.reduce((s, d) => s + d.weight, 0)
  const fitPercentRaw = SCALING_PARAMS.a * result.rawFit - SCALING_PARAMS.b

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader
            className="cursor-pointer flex flex-row items-center justify-between py-3 px-6"
            aria-label={open ? 'Hide worked example' : 'Show worked example: K1 — Creativity phase'}
          >
            <span className="font-medium text-base">
              {open ? 'Hide worked example' : 'Show worked example: K1 — Creativity phase'}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
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
                  <th className="text-right py-1">|Score-Target|</th>
                  <th className="text-right py-1">Weighted Contribution</th>
                </tr>
              </thead>
              <tbody>
                {result.dimensionDetails.map((detail) => {
                  const dim = DIMENSIONS.find(d => d.id === detail.dimensionId)
                  return (
                    <tr
                      key={detail.dimensionId}
                      className={cn(
                        'border-b border-border last:border-0',
                        detail.weight === 0 && 'text-muted-foreground'
                      )}
                    >
                      <td className="py-1.5 pr-2">{dim?.shortLabel ?? detail.dimensionId}</td>
                      <td className="text-right py-1.5">{detail.candidateScore}</td>
                      <td className="text-right py-1.5">{detail.target}</td>
                      <td className="text-right py-1.5">{detail.weight}</td>
                      <td className="text-right py-1.5">{detail.distance}</td>
                      <td className="text-right py-1.5">{detail.similarity.toFixed(3)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="mt-4 pt-4 border-t border-border text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Sum of weighted contributions:</span>{' '}
                {similaritySum.toFixed(3)}
              </p>
              <p>
                <span className="text-muted-foreground">Sum of weights:</span> {weightSum}
              </p>
              <p>
                <span className="text-muted-foreground">Raw fit:</span>{' '}
                {result.rawFit.toFixed(6)}
              </p>
              <p>
                <span className="text-muted-foreground">Scaled:</span>{' '}
                347.995 &times; {result.rawFit.toFixed(6)} &minus; 217.060 ={' '}
                {fitPercentRaw.toFixed(1)} &rarr; clamped to {result.fitPercent}%
              </p>
              <div className="pt-2">
                <ClassificationBadge
                  fitPercent={result.fitPercent}
                  classification={result.classification}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
