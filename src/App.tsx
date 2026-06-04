import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreInputForm } from "@/components/ScoreInputForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { PhaseConfigEditor } from "@/components/PhaseConfigEditor";
import { DiagnosticsPanel } from "@/components/DiagnosticsPanel";
import { FormulaPanel } from "@/components/FormulaPanel";
import { ConfigProvider } from "@/config/ConfigContext";
import type { DimensionScore } from "@/types/greiner";
import { DIMENSIONS } from "@/data/dimensions";

const neutralScores: Record<string, DimensionScore> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, 0 as DimensionScore])
);

const tabNum = "rounded-full bg-primary text-primary-foreground w-4 h-4 flex items-center justify-center text-[10px] font-semibold leading-none";

export default function App() {
  const [scores, setScores] = useState<Record<string, DimensionScore>>(neutralScores);
  const [tab, setTab] = useState("input");

  return (
    <ConfigProvider>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">Greiner Phase Fit Tool</h1>
        <p className="text-muted-foreground mt-1 mb-4 max-w-2xl text-sm leading-relaxed">
          Map Reveal-14 personality profiles to Greiner Growth Model leadership phases. Enter a
          candidate&apos;s 14 dimension scores and see how well they fit each of Greiner&apos;s six
          organisational growth phases. The model is theory-driven and fully configurable &mdash; tune
          targets, weights and bands in Model Configuration and watch the results update live.
        </p>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="input" className="gap-1.5"><span className={tabNum}>1</span> Score Input</TabsTrigger>
            <TabsTrigger value="results" className="gap-1.5"><span className={tabNum}>2</span> Results</TabsTrigger>
            <TabsTrigger value="config" className="gap-1.5"><span className={tabNum}>3</span> Model Configuration</TabsTrigger>
            <TabsTrigger value="diagnostics" className="gap-1.5"><span className={tabNum}>4</span> Diagnostics</TabsTrigger>
            <TabsTrigger value="formula" className="gap-1.5"><span className={tabNum}>5</span> Formula</TabsTrigger>
          </TabsList>
          <TabsContent value="input">
            <ScoreInputForm scores={scores} onScoresChange={setScores} />
          </TabsContent>
          <TabsContent value="results">
            <ResultsPanel scores={scores} />
          </TabsContent>
          <TabsContent value="config">
            <PhaseConfigEditor />
          </TabsContent>
          <TabsContent value="diagnostics">
            <DiagnosticsPanel active={tab === "diagnostics"} />
          </TabsContent>
          <TabsContent value="formula">
            <FormulaPanel scores={scores} />
          </TabsContent>
        </Tabs>
      </div>
    </ConfigProvider>
  );
}
