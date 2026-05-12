import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { computePhaseFit, computeAllPhases } from '@/engine/scoringEngine'
import { PHASE_NORMS } from '@/data/phaseNorms'
import { REFERENCE_CANDIDATES } from '@/data/referenceCandidates'
import { DIMENSIONS } from '@/data/dimensions'
import { ClassificationBadge } from '@/components/ClassificationBadge'
import type { DimensionScore, DimensionId } from '@/types/greiner'

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
      const creativityNorm = PHASE_NORMS.find(p => p.phaseId === 'Creativity')!
      return {
        result: computePhaseFit(k1.scores, creativityNorm),
        label: `${k1.name} \u2014 Creativity phase`,
        isLive: false,
      }
    }
    // Use current scores, pick best-fitting phase
    const typedScores = scores as Record<DimensionId, DimensionScore>
    const results = computeAllPhases(typedScores, PHASE_NORMS)
    const top = results[0]
    const topNorm = PHASE_NORMS.find(p => p.phaseId === top.phaseId)!
    return {
      result: computePhaseFit(typedScores, topNorm),
      label: `Your scores \u2014 ${top.phaseName} phase (best fit)`,
      isLive: true,
    }
  }, [scores, allZero])

  const sumContributions = result.dimensionDetails.reduce((s, d) => s + d.contribution, 0)
  const sumImportances = result.dimensionDetails.reduce((s, d) => s + d.importance, 0)

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
                No scores entered yet &mdash; showing reference candidate K1 (Creativity phase).
                Enter scores in the Score Input tab to see your own calculation here.
              </p>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-1">Dimension</th>
                  <th className="text-right py-1">Score</th>
                  <th className="text-right py-1">Target</th>
                  <th className="text-right py-1">Importance</th>
                  <th className="text-right py-1">Alignment</th>
                  <th className="text-right py-1">Contribution</th>
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
                        detail.importance === 0 && 'text-muted-foreground'
                      )}
                    >
                      <td className="py-1.5 pr-2">{dim?.shortLabel ?? detail.dimensionId}</td>
                      <td className="text-right py-1.5">{detail.candidateScore}</td>
                      <td className="text-right py-1.5">{detail.target}</td>
                      <td className="text-right py-1.5">{detail.importance}</td>
                      <td className="text-right py-1.5">{detail.alignment.toFixed(3)}</td>
                      <td className="text-right py-1.5">{detail.contribution.toFixed(3)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="mt-4 pt-4 border-t border-border text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Sum of contributions:</span>{' '}
                {sumContributions.toFixed(3)}
              </p>
              <p>
                <span className="text-muted-foreground">Sum of importances:</span> {sumImportances}
              </p>
              <p>
                <span className="text-muted-foreground">Raw ratio:</span>{' '}
                {sumContributions.toFixed(3)} / {sumImportances} = {(sumContributions / sumImportances).toFixed(4)}
              </p>
              <p>
                <span className="text-muted-foreground">Fit%:</span>{' '}
                round({(sumContributions / sumImportances).toFixed(4)} &times; 100) = {result.fitPercent}%
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
