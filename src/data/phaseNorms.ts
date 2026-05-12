import { GreinerPhase, DimensionId, PhaseDimensionSpec, PhaseNorm, DimensionNorm } from '@/types/greiner';

// Qualitative to numeric mapping from v2 spec
export const QUALITATIVE_TO_NUMERIC: Record<string, number> = {
  '++': 3,
  '+': 2,
  '0': 0,
  '-': -2,
  '--': -4,
};

// All 84 phase-dimension entries from v2 spec (6 phases x 14 dimensions)
export const PHASE_DIMENSION_WEIGHTS: Record<GreinerPhase, Record<DimensionId, PhaseDimensionSpec>> = {
  Creativity: {
    analytical_intuitive:     { qualitative: '+',  numeric:  2, target:  1 },
    conceptual_practical:     { qualitative: '+',  numeric:  2, target: -1 },
    decisive_deliberate:      { qualitative: '+',  numeric:  2, target: -1 },
    assertive_reflective:     { qualitative: '0',  numeric:  0, target:  0 },
    sociable_reserved:        { qualitative: '0',  numeric:  0, target:  0 },
    persuasive_dialogue:      { qualitative: '0',  numeric:  0, target:  0 },
    performance_sustainable:  { qualitative: '0',  numeric:  0, target:  0 },
    careful_flexible:         { qualitative: '+',  numeric:  2, target:  1 },
    adaptive_consistent:      { qualitative: '++', numeric:  3, target: -1 },
    stable_expressive:        { qualitative: '-',  numeric: -2, target: -1 },
    collaborative_independent:{ qualitative: '0',  numeric:  0, target:  0 },
    integrity_contextual:     { qualitative: '+',  numeric:  2, target:  1 },
    innovative_structured:    { qualitative: '++', numeric:  3, target: -1 },
    open_principled:          { qualitative: '++', numeric:  3, target: -1 },
  },

  Direction: {
    analytical_intuitive:     { qualitative: '+',  numeric:  2, target: -1 },
    conceptual_practical:     { qualitative: '0',  numeric:  0, target:  0 },
    decisive_deliberate:      { qualitative: '+',  numeric:  2, target: -1 },
    assertive_reflective:     { qualitative: '+',  numeric:  2, target: -1 },
    sociable_reserved:        { qualitative: '0',  numeric:  0, target:  0 },
    persuasive_dialogue:      { qualitative: '0',  numeric:  0, target:  0 },
    performance_sustainable:  { qualitative: '+',  numeric:  2, target: -1 },
    careful_flexible:         { qualitative: '++', numeric:  3, target: -1 },
    adaptive_consistent:      { qualitative: '+',  numeric:  2, target:  1 },
    stable_expressive:        { qualitative: '+',  numeric:  2, target: -1 },
    collaborative_independent:{ qualitative: '0',  numeric:  0, target:  0 },
    integrity_contextual:     { qualitative: '++', numeric:  3, target: -1 },
    innovative_structured:    { qualitative: '-',  numeric: -2, target:  1 },
    open_principled:          { qualitative: '++', numeric:  3, target:  1 },
  },

  Delegation: {
    analytical_intuitive:     { qualitative: '0',  numeric:  0, target:  0 },
    conceptual_practical:     { qualitative: '+',  numeric:  2, target: -1 },
    decisive_deliberate:      { qualitative: '+',  numeric:  2, target: -1 },
    assertive_reflective:     { qualitative: '+',  numeric:  2, target: -1 },
    sociable_reserved:        { qualitative: '0',  numeric:  0, target:  0 },
    persuasive_dialogue:      { qualitative: '0',  numeric:  0, target:  0 },
    performance_sustainable:  { qualitative: '++', numeric:  3, target: -1 },
    careful_flexible:         { qualitative: '0',  numeric:  0, target:  0 },
    adaptive_consistent:      { qualitative: '+',  numeric:  2, target: -1 },
    stable_expressive:        { qualitative: '+',  numeric:  2, target: -1 },
    collaborative_independent:{ qualitative: '++', numeric:  3, target:  1 },
    integrity_contextual:     { qualitative: '0',  numeric:  0, target:  0 },
    innovative_structured:    { qualitative: '+',  numeric:  2, target: -1 },
    open_principled:          { qualitative: '+',  numeric:  2, target: -1 },
  },

  Coordination: {
    analytical_intuitive:     { qualitative: '++', numeric:  3, target: -1 },
    conceptual_practical:     { qualitative: '0',  numeric:  0, target:  0 },
    decisive_deliberate:      { qualitative: '0',  numeric:  0, target:  0 },
    assertive_reflective:     { qualitative: '0',  numeric:  0, target:  0 },
    sociable_reserved:        { qualitative: '0',  numeric:  0, target:  0 },
    persuasive_dialogue:      { qualitative: '0',  numeric:  0, target:  0 },
    performance_sustainable:  { qualitative: '0',  numeric:  0, target:  0 },
    careful_flexible:         { qualitative: '++', numeric:  3, target: -1 },
    adaptive_consistent:      { qualitative: '++', numeric:  3, target:  1 },
    stable_expressive:        { qualitative: '+',  numeric:  2, target: -1 },
    collaborative_independent:{ qualitative: '+',  numeric:  2, target: -1 },
    integrity_contextual:     { qualitative: '+',  numeric:  2, target: -1 },
    innovative_structured:    { qualitative: '-',  numeric: -2, target:  1 },
    open_principled:          { qualitative: '+',  numeric:  2, target:  1 },
  },

  Collaboration: {
    analytical_intuitive:     { qualitative: '0',  numeric:  0, target:  0 },
    conceptual_practical:     { qualitative: '0',  numeric:  0, target:  0 },
    decisive_deliberate:      { qualitative: '-',  numeric: -2, target:  1 },
    assertive_reflective:     { qualitative: '-',  numeric: -2, target:  1 },
    sociable_reserved:        { qualitative: '+',  numeric:  2, target: -1 },
    persuasive_dialogue:      { qualitative: '++', numeric:  3, target:  1 },
    performance_sustainable:  { qualitative: '0',  numeric:  0, target:  0 },
    careful_flexible:         { qualitative: '0',  numeric:  0, target:  0 },
    adaptive_consistent:      { qualitative: '+',  numeric:  2, target: -1 },
    stable_expressive:        { qualitative: '+',  numeric:  2, target: -1 },
    collaborative_independent:{ qualitative: '++', numeric:  3, target: -1 },
    integrity_contextual:     { qualitative: '+',  numeric:  2, target:  1 },
    innovative_structured:    { qualitative: '0',  numeric:  0, target:  0 },
    open_principled:          { qualitative: '++', numeric:  3, target: -1 },
  },

  Alliances: {
    analytical_intuitive:     { qualitative: '0',  numeric:  0, target:  0 },
    conceptual_practical:     { qualitative: '++', numeric:  3, target: -1 },
    decisive_deliberate:      { qualitative: '0',  numeric:  0, target:  0 },
    assertive_reflective:     { qualitative: '0',  numeric:  0, target:  0 },
    sociable_reserved:        { qualitative: '+',  numeric:  2, target: -1 },
    persuasive_dialogue:      { qualitative: '+',  numeric:  2, target: -1 },
    performance_sustainable:  { qualitative: '0',  numeric:  0, target:  0 },
    careful_flexible:         { qualitative: '0',  numeric:  0, target:  0 },
    adaptive_consistent:      { qualitative: '++', numeric:  3, target: -1 },
    stable_expressive:        { qualitative: '0',  numeric:  0, target:  0 },
    collaborative_independent:{ qualitative: '0',  numeric:  0, target:  0 },
    integrity_contextual:     { qualitative: '+',  numeric:  2, target:  1 },
    innovative_structured:    { qualitative: '+',  numeric:  2, target: -1 },
    open_principled:          { qualitative: '++', numeric:  3, target: -1 },
  },
};

const PHASE_META: Record<GreinerPhase, { label: string }> = {
  Creativity:    { label: 'Creativity -- Speed & Innovation' },
  Direction:     { label: 'Direction -- Structure & Control' },
  Delegation:    { label: 'Delegation -- Autonomy & Trust' },
  Coordination:  { label: 'Coordination -- Systems & Efficiency' },
  Collaboration: { label: 'Collaboration -- Alignment & Adaptivity' },
  Alliances:     { label: 'Alliances -- External Focus & Influence' },
};

const PHASE_ORDER: GreinerPhase[] = [
  'Creativity',
  'Direction',
  'Delegation',
  'Coordination',
  'Collaboration',
  'Alliances',
];

const DIMENSION_IDS: DimensionId[] = [
  'analytical_intuitive',
  'conceptual_practical',
  'decisive_deliberate',
  'assertive_reflective',
  'sociable_reserved',
  'persuasive_dialogue',
  'performance_sustainable',
  'careful_flexible',
  'adaptive_consistent',
  'stable_expressive',
  'collaborative_independent',
  'integrity_contextual',
  'innovative_structured',
  'open_principled',
];

export const PHASE_NORMS: PhaseNorm[] = PHASE_ORDER.map(phaseId => ({
  phaseId,
  phaseName: phaseId,
  phaseLabel: PHASE_META[phaseId].label,
  dimensions: DIMENSION_IDS.map((dimId): DimensionNorm => ({
    dimensionId: dimId,
    spec: PHASE_DIMENSION_WEIGHTS[phaseId][dimId],
  })),
}));
