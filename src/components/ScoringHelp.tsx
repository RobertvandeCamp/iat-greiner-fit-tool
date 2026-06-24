import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Plain-language explainer of how the scoring works and what each knob does.
 * Mirrors the Dutch calibration brief (CALIBRATIE-MARCO.md) in simple English so
 * a non-expert can read it inside the tool and explain it to others.
 */
export function ScoringHelp({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Card className="border-primary/30">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer flex flex-row items-center justify-between py-3 px-6">
            <span className="font-medium text-base">How scoring works (plain language)</span>
            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 px-6 pb-4 text-sm leading-relaxed space-y-4 max-w-3xl">
            <div>
              <p className="font-medium">The idea in three sentences</p>
              <p className="text-muted-foreground">
                Each Greiner phase has a <strong>wishlist</strong> for a leader: for every trait it says
                <em> which side</em> we want (e.g. "more innovative") and <em>how important</em> that trait
                is for this phase. The tool measures how close a person sits to that wishlist. The closer
                they are, the higher the <strong>fit&nbsp;%</strong> for that phase.
              </p>
            </div>

            <div>
              <p className="font-medium">The three things you set per trait</p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li>
                  <strong>Target (−3…+3)</strong> — what this phase wants. The sign is the <em>side</em>
                  (−3 = strongly the left pole, +3 = strongly the right pole, 0 = doesn&apos;t matter); the
                  distance from 0 is <em>how strongly</em>.
                </li>
                <li>
                  <strong>Weight</strong> — how much this trait counts: <strong>Critical</strong> (×3),
                  <strong> Supporting</strong> (×1), or <strong>Neutral</strong> (×0, ignored).
                </li>
                <li>
                  <strong>Rationale</strong> — a note explaining why. This does <strong>not</strong> change
                  the score; it&apos;s just documentation.
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium">How a person scores (mini example)</p>
              <p className="text-muted-foreground">
                Say a phase wants Target <strong>−3</strong> on a trait and marks it <strong>Critical</strong>.
                A person scoring −3 = exactly what the phase wants → <strong>full points</strong>; scoring 0
                (neutral) → half points; scoring +3 (the opposite side) → <strong>zero points</strong>. The
                tool does this for every trait that counts, weighs them (Critical heavier than Supporting),
                and turns it into one <strong>fit&nbsp;% per phase</strong>, then a label (Strong fit / Good
                fit / …).
              </p>
            </div>

            <div>
              <p className="font-medium">The knobs you can turn</p>
              <ul className="text-muted-foreground list-disc pl-5 space-y-1">
                <li><strong>Target</strong> — moves where the "full points" sit; different target → different people fit better.</li>
                <li><strong>Weight</strong> — Critical can make or break the fit; Neutral takes the trait out of the calculation.</li>
                <li><strong>Wrong-pole penalty</strong> — 0 = only distance counts; higher = someone on the opposite side drops to zero faster.</li>
                <li><strong>Floor normalization</strong> — on (recommended): percentages use the whole 0–100 range; off: everything clusters near the middle.</li>
                <li><strong>Classification bands</strong> — the cut-offs that turn a % into a label; raise them to be stricter about "Strong fit".</li>
                <li><strong>Export / Import / Reset to defaults</strong> — save or load a calibration, or go back to the literature starting point.</li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: a "perfect" person who matches every target scores 100% on that phase — a quick check
              that a phase&apos;s wishlist makes sense as a whole. Formula (optional): per-trait fit =
              1 − |score − target| / 6, then a weighted average scaled to 0–100%.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
