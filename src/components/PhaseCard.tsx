import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ClassificationBadge } from '@/components/ClassificationBadge'
import { DIMENSIONS } from '@/data/dimensions'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import type { FitResult } from '@/types/greiner'

interface PhaseCardProps {
  result: FitResult
}

export function PhaseCard({ result }: PhaseCardProps) {
  const [open, setOpen] = useState(false)

  // Sort: highest importance first, then by contribution desc
  const sortedDetails = [...result.dimensionDetails].sort((a, b) => b.importance - a.importance || b.contribution - a.contribution)

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader
            className="cursor-pointer flex flex-row items-center justify-between py-3 px-6"
            aria-label={open ? `Collapse ${result.phaseName} details` : `Expand ${result.phaseName} details`}
          >
            <span className="font-medium text-base">{result.phaseName}</span>
            <div className="flex items-center gap-3">
              <ClassificationBadge
                fitPercent={result.fitPercent}
                classification={result.classification}
              />
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-200',
                  open && 'rotate-180'
                )}
              />
            </div>
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
                  <th className="text-right py-1">Importance</th>
                  <th className="text-right py-1">Alignment</th>
                  <th className="text-right py-1">Contribution</th>
                </tr>
              </thead>
              <tbody>
                {sortedDetails.map((detail) => {
                  const dim = DIMENSIONS.find((d) => d.id === detail.dimensionId)
                  const maxContribution = detail.importance > 0 ? detail.importance : 0
                  const fillPercent = maxContribution > 0 ? (detail.contribution / maxContribution) * 100 : 0

                  return (
                    <tr
                      key={detail.dimensionId}
                      className={cn(
                        'border-b border-border last:border-0',
                        detail.importance === 0 && 'text-muted-foreground'
                      )}
                      title={detail.importance === 0 ? 'Neutral — does not contribute to fit score' : undefined}
                    >
                      <td className="py-1.5 pr-2">{dim?.shortLabel ?? detail.dimensionId}</td>
                      <td className="text-right py-1.5">{detail.candidateScore}</td>
                      <td className="text-right py-1.5">{detail.target}</td>
                      <td className="text-right py-1.5">{detail.importance}</td>
                      <td className="text-right py-1.5">
                        <div className="flex items-center justify-end gap-2">
                          <span>{detail.alignment.toFixed(2)}</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-1.5">{detail.contribution.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
