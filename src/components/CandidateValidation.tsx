import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClassificationBadge } from '@/components/ClassificationBadge'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'
import type { CandidateProfile, FitResult } from '@/types/greiner'

interface CandidateValidationProps {
  candidate: CandidateProfile
  results: FitResult[]  // sorted by fitPercent desc from computeAllPhases
}

export function CandidateValidation({ candidate, results }: CandidateValidationProps) {
  // Sort expected rankings by rank ascending (rank 1 = best fit first)
  const expectedOrder = [...candidate.expectedRankings].sort((a, b) => a.rank - b.rank)

  // Computed order from results array position (already sorted by fitPercent desc)
  const computedOrder = results.map((r) => r.phaseId)

  // Pass if all phaseIds appear in the same order
  const passed = expectedOrder.every((exp, i) => exp.phaseId === computedOrder[i])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-6">
        <span className="text-base font-semibold">{candidate.name}</span>
        {passed ? (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Passed
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-600" />
            Failed
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-0 px-6 pb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left py-1">Phase</th>
              <th className="text-right py-1">Expected Rank</th>
              <th className="text-right py-1">Computed Rank</th>
              <th className="text-right py-1">Fit %</th>
              <th className="text-right py-1">Classification</th>
            </tr>
          </thead>
          <tbody>
            {expectedOrder.map((exp) => {
              const result = results.find((r) => r.phaseId === exp.phaseId)
              const computedRank = result ? computedOrder.indexOf(exp.phaseId) + 1 : null
              const rankMismatch = computedRank !== exp.rank

              return (
                <tr
                  key={exp.phaseId}
                  className={cn(
                    'border-b border-border last:border-0',
                    rankMismatch && 'bg-red-50'
                  )}
                >
                  <td className="py-1.5 pr-2">{result?.phaseName ?? exp.phaseId}</td>
                  <td className="text-right py-1.5">{exp.rank}</td>
                  <td className="text-right py-1.5">{computedRank ?? '—'}</td>
                  <td className="text-right py-1.5">
                    {result ? (
                      <ClassificationBadge
                        fitPercent={result.fitPercent}
                        classification={result.classification}
                      />
                    ) : '—'}
                  </td>
                  <td className="text-right py-1.5">
                    {result?.classification ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
