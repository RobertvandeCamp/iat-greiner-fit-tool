import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreInputForm } from "@/components/ScoreInputForm";

export default function App() {
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
          <ScoreInputForm />
        </TabsContent>
        <TabsContent value="results">
          <p className="text-muted-foreground">Results display coming in Phase 34.</p>
        </TabsContent>
        <TabsContent value="validation">
          <p className="text-muted-foreground">Validation tab coming in Phase 35.</p>
        </TabsContent>
        <TabsContent value="formula">
          <p className="text-muted-foreground">Formula transparency coming in Phase 35.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
