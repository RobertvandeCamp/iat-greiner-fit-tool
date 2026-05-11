import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { computePhaseFit, computeAllPhases } from '@/engine/scoringEngine'
import { PHASE_NORMS } from '@/data/phaseNorms'
import { SCALING_PARAMS } from '@/data/scalingParams'
import { REFERENCE_CANDIDATES } from '@/data/referenceCandidates'
import { DIMENSIONS } from '@/data/dimensions'
import { ClassificationBadge } from '@/components/ClassificationBadge'
import type { DimensionScore } from '@/types/greiner'

interface WorkedExampleProps {
  scores: Record<string, DimensionScore>
}

export function WorkedExample({ scores }: WorkedExampleProps) {
  const [open, setOpen] = useState(false)

  const allZero = Object.values(scores).every((v) => v === 0)

  const { result, label, isLive } = useMemo(() => {
    if (allZero) {
      // Fall back to K1 / Creativity
      const k1 = REFERENCE_CANDIDATES[0]
      const creativityNorm = PHASE_NORMS.find(p => p.phaseId === 'creativity')!
      return {
        result: computePhaseFit(k1.scores, creativityNorm, SCALING_PARAMS),
        label: `${k1.name} \u2014 Creativity phase`,
        isLive: false,
      }
    }
    // Use current scores, pick best-fitting phase
    const results = computeAllPhases(scores, PHASE_NORMS, SCALING_PARAMS)
    const top = results[0]
    const topNorm = PHASE_NORMS.find(p => p.phaseId === top.phaseId)!
    return {
      result: computePhaseFit(scores, topNorm, SCALING_PARAMS),
      label: `Your scores \u2014 ${top.phaseName} phase (best fit)`,
      isLive: true,
    }
  }, [scores, allZero])

  const similaritySum = result.dimensionDetails.reduce((s, d) => s + d.similarity, 0)
  const weightSum = result.dimensionDetails.reduce((s, d) => s + d.weight, 0)
  const fitPercentRaw = SCALING_PARAMS.a * result.rawFit - SCALING_PARAMS.b

  const triggerText = open
    ? `Hide worked example`
    : `Show worked example: ${label}`

  return (
    <Card className={isLive ? 'border-primary/30' : undefined}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader
            className="cursor-pointer flex flex-row items-center justify-between py-3 px-6"
            aria-label={triggerText}
          >
            <span className="font-medium text-base">
              {triggerText}
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
            {!isLive && (
              <p className="text-xs text-muted-foreground mb-3">
                No scores entered yet &mdash; showing reference candidate K1.
                Enter scores in the Score Input tab to see your own calculation here.
              </p>
            )}
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
