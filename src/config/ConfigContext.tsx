import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  ModelConfig,
  GreinerPhase,
  DimensionId,
  PhaseDimensionConfig,
  ClassificationBand,
  ScoringOptions,
} from '@/types/greiner';
import { cloneDefaultConfig } from '@/data/defaultConfig';

const STORAGE_KEY = 'greiner-config-v1';

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
      const parsed = JSON.parse(raw) as ModelConfig;
      if (parsed && parsed.phases && parsed.bands && parsed.scoring) return parsed;
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
    try {
      const parsed = JSON.parse(json) as ModelConfig;
      if (!parsed?.phases || !parsed?.bands || !parsed?.scoring) {
        return { ok: false, error: 'Missing phases, bands or scoring' };
      }
      setConfig(parsed);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
    }
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
