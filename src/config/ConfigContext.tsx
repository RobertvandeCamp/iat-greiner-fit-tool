import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  ModelConfig,
  GreinerPhase,
  DimensionId,
  PhaseDimensionConfig,
  ClassificationBand,
  ScoringOptions,
  WeightTier,
} from '@/types/greiner';
import { cloneDefaultConfig, PHASE_ORDER, DEFAULT_BANDS } from '@/data/defaultConfig';
import { DIMENSIONS } from '@/data/dimensions';

const STORAGE_KEY = 'greiner-config-v1';

const WEIGHT_TIERS: WeightTier[] = ['Critical', 'Supporting', 'Neutral'];

/**
 * Validate a parsed object as a complete, well-formed ModelConfig.
 * Rejects anything that could crash scoring or produce NaN: every phase and
 * every dimension must be present with an in-range integer target and a valid
 * weight tier; bands and scoring must be well-typed.
 */
function validateConfig(c: unknown): { ok: true; config: ModelConfig } | { ok: false; error: string } {
  if (!c || typeof c !== 'object') return { ok: false, error: 'Not an object' };
  const cfg = c as Partial<ModelConfig>;

  if (!cfg.phases || typeof cfg.phases !== 'object') return { ok: false, error: 'Missing phases' };
  for (const phaseId of PHASE_ORDER) {
    const phase = (cfg.phases as Record<string, unknown>)[phaseId];
    if (!phase || typeof phase !== 'object') return { ok: false, error: `Missing phase: ${phaseId}` };
    if ((phase as { phaseId?: string }).phaseId !== phaseId) {
      return { ok: false, error: `Phase ${phaseId} has mismatched phaseId` };
    }
    const dims = (phase as { dimensions?: Record<string, unknown> }).dimensions;
    if (!dims || typeof dims !== 'object') return { ok: false, error: `Phase ${phaseId} missing dimensions` };
    for (const dim of DIMENSIONS) {
      const cell = dims[dim.id] as Partial<PhaseDimensionConfig> | undefined;
      if (!cell || typeof cell !== 'object') return { ok: false, error: `${phaseId}.${dim.id} missing` };
      if (!Number.isInteger(cell.target) || (cell.target as number) < -3 || (cell.target as number) > 3) {
        return { ok: false, error: `${phaseId}.${dim.id} target must be an integer -3..3` };
      }
      if (!WEIGHT_TIERS.includes(cell.weight as WeightTier)) {
        return { ok: false, error: `${phaseId}.${dim.id} weight invalid` };
      }
    }
    // Reject stray dimension keys so they can't be scored and skew the result.
    if (Object.keys(dims).length !== DIMENSIONS.length) {
      return { ok: false, error: `Phase ${phaseId} has unexpected dimension keys` };
    }
  }

  if (!Array.isArray(cfg.bands) || cfg.bands.length === 0) return { ok: false, error: 'Missing/empty bands' };
  for (const b of cfg.bands) {
    if (!Number.isFinite(b?.min) || b.min < 0 || b.min > 100 || typeof b?.label !== 'string') {
      return { ok: false, error: 'Each band needs a numeric min in 0..100 and a string label' };
    }
  }
  const mins = cfg.bands.map((b) => b.min);
  if (new Set(mins).size !== mins.length) {
    return { ok: false, error: 'Band minimums must be unique' };
  }
  if (!mins.includes(0)) {
    return { ok: false, error: 'Bands need a catch-all with min 0' };
  }

  const s = cfg.scoring as Partial<ScoringOptions> | undefined;
  if (
    !s ||
    !Number.isFinite(s.wrongPolePenalty) ||
    (s.wrongPolePenalty as number) < 0 ||
    (s.wrongPolePenalty as number) > 1 ||
    typeof s.floorNormalize !== 'boolean'
  ) {
    return { ok: false, error: 'scoring needs wrongPolePenalty in 0..1 and a boolean floorNormalize' };
  }

  return { ok: true, config: cfg as ModelConfig };
}

interface ConfigContextValue {
  config: ModelConfig;
  isDirty: boolean; // differs from default
  updateDimension: (phase: GreinerPhase, dim: DimensionId, patch: Partial<PhaseDimensionConfig>) => void;
  updateBands: (bands: ClassificationBand[]) => void;
  updateScoring: (patch: Partial<ScoringOptions>) => void;
  resetToDefaults: () => void;
  exportConfig: () => void;
  importConfig: (json: string) => { ok: boolean; error?: string };
  replaceConfig: (config: ModelConfig) => void;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

/**
 * Repair only the "soft" fields (bands + penalty) of an otherwise structurally
 * sound config: clamp the penalty to 0..1, clamp/round band mins to 0..100,
 * drop duplicate mins, and force a min-0 catch-all. Used on reload so a band
 * the editor left invalid does NOT discard the valuable phase calibration.
 */
function repairSoftFields(parsed: ModelConfig): ModelConfig {
  const cfg: ModelConfig = { ...parsed };

  // Scoring: clamp/repair to valid values (default rather than drop the config).
  const rawPenalty = cfg.scoring?.wrongPolePenalty;
  cfg.scoring = {
    wrongPolePenalty: Number.isFinite(rawPenalty) ? Math.max(0, Math.min(1, rawPenalty as number)) : 0,
    floorNormalize: typeof cfg.scoring?.floorNormalize === 'boolean' ? cfg.scoring.floorNormalize : true,
  };

  // Bands: clamp/round, drop dupes, ensure a min-0 catch-all.
  const seen = new Set<number>();
  let bands: ClassificationBand[] = (Array.isArray(cfg.bands) ? cfg.bands : [])
    .filter((b) => b && Number.isFinite(b.min) && typeof b.label === 'string')
    .map((b) => ({ min: Math.max(0, Math.min(100, Math.round(b.min))), label: b.label }))
    .filter((b) => {
      if (seen.has(b.min)) return false;
      seen.add(b.min);
      return true;
    });
  if (bands.length > 0 && !bands.some((b) => b.min === 0)) {
    const lowestIdx = bands.reduce((mi, b, i, arr) => (b.min < arr[mi].min ? i : mi), 0);
    const seen2 = new Set<number>();
    bands = bands
      .map((b, i) => (i === lowestIdx ? { ...b, min: 0 } : b))
      .filter((b) => {
        if (seen2.has(b.min)) return false;
        seen2.add(b.min);
        return true;
      });
  }
  // If nothing usable survived, fall back to the default band set rather than
  // discarding the (valuable) phase calibration.
  cfg.bands = bands.length > 0 ? bands : DEFAULT_BANDS.map((b) => ({ ...b }));

  return cfg;
}

function loadInitial(): ModelConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const direct = validateConfig(parsed);
      if (direct.ok) return direct.config;
      // Salvage: fix only the soft band/penalty fields, keep phase calibration.
      const repaired = validateConfig(repairSoftFields(parsed as ModelConfig));
      if (repaired.ok) return repaired.config;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return cloneDefaultConfig();
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ModelConfig>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* storage may be full / unavailable */
    }
  }, [config]);

  const isDirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(cloneDefaultConfig()),
    [config],
  );

  const updateDimension = useCallback(
    (phase: GreinerPhase, dim: DimensionId, patch: Partial<PhaseDimensionConfig>) => {
      setConfig(prev => ({
        ...prev,
        phases: {
          ...prev.phases,
          [phase]: {
            ...prev.phases[phase],
            dimensions: {
              ...prev.phases[phase].dimensions,
              [dim]: { ...prev.phases[phase].dimensions[dim], ...patch },
            },
          },
        },
      }));
    },
    [],
  );

  const updateBands = useCallback((bands: ClassificationBand[]) => {
    setConfig(prev => ({ ...prev, bands }));
  }, []);

  const updateScoring = useCallback((patch: Partial<ScoringOptions>) => {
    setConfig(prev => ({ ...prev, scoring: { ...prev.scoring, ...patch } }));
  }, []);

  const resetToDefaults = useCallback(() => setConfig(cloneDefaultConfig()), []);

  const replaceConfig = useCallback((c: ModelConfig) => setConfig(c), []);

  const exportConfig = useCallback(() => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'greiner-config.json';
    a.click();
    // Defer revoke so the browser can start the download first.
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, [config]);

  const importConfig = useCallback((json: string): { ok: boolean; error?: string } => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
    }
    const result = validateConfig(parsed);
    if (!result.ok) return { ok: false, error: result.error };
    setConfig(result.config);
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      config,
      isDirty,
      updateDimension,
      updateBands,
      updateScoring,
      resetToDefaults,
      exportConfig,
      importConfig,
      replaceConfig,
    }),
    [config, isDirty, updateDimension, updateBands, updateScoring, resetToDefaults, exportConfig, importConfig, replaceConfig],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
