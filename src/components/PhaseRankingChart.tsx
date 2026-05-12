import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { FitResult, Classification } from '@/types/greiner'

interface PhaseRankingChartProps {
  results: FitResult[]
}

const CLASSIFICATION_COLORS: Record<Classification, { fill: string; stroke: string }> = {
  'Sterke fit': { fill: '#dcfce7', stroke: '#166534' },
  'Goede fit':  { fill: '#dbeafe', stroke: '#1e40af' },
  'Risicofit':  { fill: '#fef3c7', stroke: '#92400e' },
  'Mismatch':   { fill: '#fee2e2', stroke: '#991b1b' },
}

export function PhaseRankingChart({ results }: PhaseRankingChartProps) {
  const data = results.map((r) => ({
    name: r.phaseName,
    value: r.fitPercent,
    classification: r.classification,
  }))

  return (
    <div role="img" aria-label="Horizontal bar chart showing phase fit percentages">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Fit % by Phase</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 16, right: 16, top: 8, bottom: 8 }}
        >
          <XAxis type="number" domain={[0, 100]} unit="%" />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, _name, props) =>
              [`${value}% — ${(props.payload as { name: string; classification: string }).classification}`, (props.payload as { name: string; classification: string }).name]
            }
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={CLASSIFICATION_COLORS[entry.classification as Classification].fill}
                stroke={CLASSIFICATION_COLORS[entry.classification as Classification].stroke}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
