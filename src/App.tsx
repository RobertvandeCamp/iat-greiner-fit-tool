import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreInputForm } from "@/components/ScoreInputForm";
import type { DimensionScore } from "@/types/greiner";
import { DIMENSIONS } from "@/data/dimensions";

const neutralScores: Record<string, DimensionScore> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, 0 as DimensionScore])
);

export default function App() {
  const [scores, setScores] = useState<Record<string, DimensionScore>>(neutralScores);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Greiner Phase Fit Tool</h1>
      <Tabs defaultValue="input">
        <TabsList className="mb-4">
          <TabsTrigger value="input">Score Input</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="formula">Formula</TabsTrigger>
        </TabsList>
        <TabsContent value="input">
          <ScoreInputForm scores={scores} onScoresChange={setScores} />
        </TabsContent>
        <TabsContent value="results">
          <p className="text-muted-foreground">Results panel coming next.</p>
        </TabsContent>
        <TabsContent value="validation">
          <p className="text-muted-foreground">Validation tab coming in Phase 36.</p>
        </TabsContent>
        <TabsContent value="formula">
          <p className="text-muted-foreground">Formula transparency coming in Phase 36.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
