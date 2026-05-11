import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreInputForm } from "@/components/ScoreInputForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ValidationPanel } from "@/components/ValidationPanel";
import { FormulaPanel } from "@/components/FormulaPanel";
import type { DimensionScore } from "@/types/greiner";
import { DIMENSIONS } from "@/data/dimensions";

const neutralScores: Record<string, DimensionScore> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, 0 as DimensionScore])
);

export default function App() {
  const [scores, setScores] = useState<Record<string, DimensionScore>>(neutralScores);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Greiner Phase Fit Tool</h1>
      <p className="text-muted-foreground mt-1 mb-4 max-w-2xl text-sm leading-relaxed">
        Map IAT personality profiles to Greiner Growth Model leadership phases.
        This tool takes Reveal-14 implicit association scores and calculates how well
        a candidate&apos;s personality fits each of Greiner&apos;s six organisational growth phases.
      </p>

      <Tabs defaultValue="input">
        <TabsList className="mb-4">
          <TabsTrigger value="input" className="gap-1.5"><span className="rounded-full bg-primary text-primary-foreground w-4 h-4 flex items-center justify-center text-[10px] font-semibold leading-none">1</span> Score Input</TabsTrigger>
          <TabsTrigger value="results" className="gap-1.5"><span className="rounded-full bg-primary text-primary-foreground w-4 h-4 flex items-center justify-center text-[10px] font-semibold leading-none">2</span> Results</TabsTrigger>
          <TabsTrigger value="validation" className="gap-1.5"><span className="rounded-full bg-primary text-primary-foreground w-4 h-4 flex items-center justify-center text-[10px] font-semibold leading-none">3</span> Validation</TabsTrigger>
          <TabsTrigger value="formula" className="gap-1.5"><span className="rounded-full bg-primary text-primary-foreground w-4 h-4 flex items-center justify-center text-[10px] font-semibold leading-none">4</span> Formula</TabsTrigger>
        </TabsList>
        <TabsContent value="input">
          <ScoreInputForm scores={scores} onScoresChange={setScores} />
        </TabsContent>
        <TabsContent value="results">
          <ResultsPanel scores={scores} />
        </TabsContent>
        <TabsContent value="validation">
          <ValidationPanel />
        </TabsContent>
        <TabsContent value="formula">
          <FormulaPanel scores={scores} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
