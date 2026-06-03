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
import { cloneDefaultConfig, PHASE_ORDER } from '@/data/defaultConfig';
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
    if (!Number.isFinite(b?.min) || typeof b?.label !== 'string') {
      return { ok: false, error: 'Each band needs a finite numeric min and a string label' };
    }
  }

  const s = cfg.scoring as Partial<ScoringOptions> | undefined;
  if (!s || !Number.isFinite(s.wrongPolePenalty) || typeof s.floorNormalize !== 'boolean') {
    return { ok: false, error: 'scoring needs a finite wrongPolePenalty and a boolean floorNormalize' };
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

function loadInitial(): ModelConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const result = validateConfig(JSON.parse(raw));
      if (result.ok) return result.config;
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
    URL.revokeObjectURL(url);
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
