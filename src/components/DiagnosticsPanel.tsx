import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useConfig } from '@/config/ConfigContext'
import { confusionMatrix, winnerDistribution } from '@/engine/diagnostics'
import { PHASE_ORDER } from '@/data/defaultConfig'
import { cn } from '@/lib/utils'

const MC_N = 2000

function cellTone(pct: number): string {
  if (pct >= 75) return 'bg-green-100 text-green-900'
  if (pct >= 55) return 'bg-blue-50 text-blue-900'
  if (pct >= 40) return 'bg-amber-50 text-amber-900'
  return 'bg-red-50 text-red-900'
}

export function DiagnosticsPanel() {
  const { config } = useConfig()
  const [seed, setSeed] = useState(12345)

  const cm = useMemo(() => confusionMatrix(config), [config])
  const wd = useMemo(() => winnerDistribution(config, MC_N, seed), [config, seed])

  const short = (p: string) => p.slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Calibration diagnostics</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1 max-w-2xl">
          Two checks on how well the current config <em>discriminates</em> between phases. They update
          live as you edit the model. Use them while calibrating to make sure each phase stays distinct.
        </p>
      </div>

      {/* Confusion matrix */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Archetype confusion matrix</span>
            <span className={cn('text-sm font-medium', cm.diagonalHits === 6 ? 'text-green-700' : 'text-amber-700')}>
              Diagonal {cm.diagonalHits}/6 · min margin {cm.minMargin}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            Each row feeds a phase&apos;s <em>ideal</em> profile (its target vector) through the model.
            A well-tuned model puts the highest score on the diagonal (own phase) — bold cells. ✓ = the
            row&apos;s top phase is its own; ⚠ = it loses to a rival.
          </p>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse">
              <thead>
                <tr className="text-muted-foreground text-xs">
                  <th className="text-left p-1.5">ideal ↓ \ phase →</th>
                  {PHASE_ORDER.map((p) => (
                    <th key={p} className="p-1.5 text-center" title={p}>{short(p)}</th>
                  ))}
                  <th className="p-1.5 text-center">✓?</th>
                </tr>
              </thead>
              <tbody>
                {cm.rows.map((row) => (
                  <tr key={row.archetype} className="border-t border-border">
                    <td className="p-1.5 font-medium whitespace-nowrap">{row.archetype}</td>
                    {PHASE_ORDER.map((p) => {
                      const v = row.fits[p]
                      const isDiag = p === row.archetype
                      return (
                        <td
                          key={p}
                          className={cn('p-1.5 text-center tabular-nums', cellTone(v), isDiag && 'font-bold ring-1 ring-inset ring-primary/40')}
                        >
                          {v}
                        </td>
                      )
                    })}
                    <td className="p-1.5 text-center">{row.diagonalIsTop ? '✓' : '⚠'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monte-Carlo winner distribution */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Random-profile winner distribution</span>
            <button
              className="text-sm px-3 py-1.5 rounded border border-input bg-background hover:bg-muted transition-colors"
              onClick={() => setSeed((s) => s + 1)}
            >
              Re-roll
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {MC_N.toLocaleString()} random profiles (seed {seed}); bars show which phase each profile fits
            best. A balanced spread is healthy — one phase winning a large majority signals bias. Top:
            <span className={cn('font-medium ml-1', wd.topShare >= 40 ? 'text-amber-700' : 'text-foreground')}>
              {wd.topPhase} {wd.topShare}%
            </span>.
          </p>
          <div className="space-y-1.5">
            {PHASE_ORDER.map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm">
                <span className="w-28 shrink-0">{p}</span>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-primary/70 rounded" style={{ width: `${wd.percentages[p]}%` }} />
                </div>
                <span className="w-20 shrink-0 text-right tabular-nums text-muted-foreground">
                  {wd.percentages[p]}% · avg {wd.avgFit[p]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
