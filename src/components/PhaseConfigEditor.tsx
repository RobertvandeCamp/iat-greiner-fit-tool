import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/config/ConfigContext';
import { DIMENSIONS } from '@/data/dimensions';
import { PHASE_ORDER } from '@/data/defaultConfig';
import type { DimensionScore, WeightTier, ClassificationBand } from '@/types/greiner';

const TARGET_OPTIONS: DimensionScore[] = [-3, -2, -1, 0, 1, 2, 3];
const WEIGHT_OPTIONS: WeightTier[] = ['Critical', 'Supporting', 'Neutral'];

const inputCls =
  'border border-input rounded px-1.5 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring';

function ScoringOptionsEditor() {
  const { config, updateScoring } = useConfig();
  const { wrongPolePenalty, floorNormalize } = config.scoring;

  return (
    <Card>
      <CardHeader className="pb-2">
        <span className="font-medium">Scoring options</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Wrong-pole penalty</label>
            <span className="text-sm tabular-nums text-muted-foreground">{wrongPolePenalty.toFixed(2)}</span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={[wrongPolePenalty]}
            onValueChange={(v) => updateScoring({ wrongPolePenalty: v[0] })}
          />
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            0 = symmetric distance-to-target. Higher values subtract extra fit credit when a candidate
            sits on the <em>opposite</em> pole from a target (neutral/weak scores are not extra-penalized).
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Floor normalization</label>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Rescale each phase so 0% = a profile maximally opposed to the phase, 100% = exact target.
              Off = raw weighted-mean fit × 100.
            </p>
          </div>
          <Switch checked={floorNormalize} onCheckedChange={(c) => updateScoring({ floorNormalize: c })} />
        </div>
      </CardContent>
    </Card>
  );
}

function BandsEditor() {
  const { config, updateBands } = useConfig();
  const bands = config.bands;

  // Local draft for the min inputs so partial typing (e.g. clearing "75") does
  // not push transient low thresholds into the live config / localStorage.
  const [minDraft, setMinDraft] = useState<Record<number, string>>({});
  const [minError, setMinError] = useState<string | null>(null);

  function patch(i: number, p: Partial<ClassificationBand>) {
    updateBands(bands.map((b, idx) => (idx === i ? { ...b, ...p } : b)));
  }

  function commitMin(i: number) {
    const draft = minDraft[i];
    if (draft === undefined) return;
    const n = Number(draft);
    const clamped = Number.isFinite(n) && draft.trim() !== '' ? Math.max(0, Math.min(100, Math.round(n))) : bands[i].min;
    setMinDraft((d) => { const next = { ...d }; delete next[i]; return next; });
    if (clamped === bands[i].min) return;
    // Reject a duplicate min so the live config (and classify) stays unambiguous.
    if (bands.some((b, idx) => idx !== i && b.min === clamped)) {
      setMinError(`Min ${clamped}% is already used — keep band minimums unique.`);
      return;
    }
    setMinError(null);
    patch(i, { min: clamped });
  }

  const mins = bands.map((b) => b.min);
  const hasDupes = new Set(mins).size !== mins.length;
  const hasCatchAll = mins.includes(0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <span className="font-medium">Classification bands</span>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left py-1">Min fit %</th>
              <th className="text-left py-1">Label</th>
            </tr>
          </thead>
          <tbody>
            {bands.map((b, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={minDraft[i] ?? String(b.min)}
                    className={`${inputCls} w-20`}
                    onChange={(e) => { setMinError(null); setMinDraft((d) => ({ ...d, [i]: e.target.value })) }}
                    onBlur={() => commitMin(i)}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                  />
                </td>
                <td className="py-1.5">
                  <input
                    type="text"
                    value={b.label}
                    className={`${inputCls} w-48`}
                    onChange={(e) => patch(i, { label: e.target.value })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground mt-2">
          Bands are matched highest-min first; the band with min 0 is the catch-all. Edits to min apply on blur.
        </p>
        {!hasCatchAll && (
          <p className="text-xs text-amber-700 mt-1">⚠ No catch-all band (min 0) — scores below the lowest band show no label.</p>
        )}
        {hasDupes && (
          <p className="text-xs text-amber-700 mt-1">⚠ Duplicate minimums — classification is ambiguous; make each min unique.</p>
        )}
        {minError && <p className="text-xs text-amber-700 mt-1">⚠ {minError}</p>}
      </CardContent>
    </Card>
  );
}

function ConfigToolbar() {
  const { isDirty, resetToDefaults, exportConfig, importConfig } = useConfig();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importConfig(String(reader.result));
      setMsg(res.ok ? 'Config imported.' : `Import failed: ${res.error}`);
      setTimeout(() => setMsg(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const btn = 'text-sm px-3 py-1.5 rounded border border-input bg-background hover:bg-muted transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={btn} onClick={exportConfig}>Export JSON</button>
      <button className={btn} onClick={() => fileRef.current?.click()}>Import JSON</button>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
      <button
        className={`${btn} ${isDirty ? '' : 'opacity-50 cursor-not-allowed'}`}
        onClick={() => { if (isDirty && confirm('Reset all targets, weights, bands and scoring to literature defaults?')) resetToDefaults(); }}
        disabled={!isDirty}
      >
        Reset to defaults
      </button>
      {isDirty && <Badge variant="secondary">Modified from defaults</Badge>}
      {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
    </div>
  );
}

export function PhaseConfigEditor() {
  const { config, updateDimension } = useConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Model configuration</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1 max-w-2xl">
          Edit each phase&apos;s target pole, weight tier and rationale, plus the scoring options and
          classification bands. Changes apply live to Results. Defaults are derived from the Greiner
          literature (not calibrated to candidates). Edits persist in your browser; export to save or share.
        </p>
      </div>

      <ConfigToolbar />

      <div className="grid gap-4 md:grid-cols-2">
        <ScoringOptionsEditor />
        <BandsEditor />
      </div>

      {PHASE_ORDER.map((phaseId) => {
        const phase = config.phases[phaseId];
        return (
          <Card key={phaseId}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-base">{phase.phaseLabel}</span>
                {phase.extrapolated && <Badge variant="secondary">extrapolated</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-left py-1">Dimension (− left / + right)</th>
                    <th className="text-left py-1 w-20">Target</th>
                    <th className="text-left py-1 w-32">Weight</th>
                    <th className="text-left py-1">Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {DIMENSIONS.map((dim) => {
                    const cell = phase.dimensions[dim.id];
                    return (
                      <tr key={dim.id} className="border-b border-border last:border-0 align-top">
                        <td className="py-1.5 pr-2">
                          <span className="font-medium">{dim.shortLabel}</span>
                          <span className="block text-[11px] text-muted-foreground">
                            −3 {dim.leftTrait} · +3 {dim.rightTrait}
                          </span>
                        </td>
                        <td className="py-1.5 pr-2">
                          <select
                            className={`${inputCls} w-16`}
                            value={cell.target}
                            onChange={(e) =>
                              updateDimension(phaseId, dim.id, { target: Number(e.target.value) as DimensionScore })
                            }
                          >
                            {TARGET_OPTIONS.map((t) => (
                              <option key={t} value={t}>{t > 0 ? `+${t}` : t}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 pr-2">
                          <select
                            className={`${inputCls} w-28`}
                            value={cell.weight}
                            onChange={(e) =>
                              updateDimension(phaseId, dim.id, { weight: e.target.value as WeightTier })
                            }
                          >
                            {WEIGHT_OPTIONS.map((w) => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5">
                          <input
                            type="text"
                            className={`${inputCls} w-full`}
                            value={cell.rationale}
                            onChange={(e) => updateDimension(phaseId, dim.id, { rationale: e.target.value })}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
