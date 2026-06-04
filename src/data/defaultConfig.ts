import {
  DimensionId,
  GreinerPhase,
  ModelConfig,
  PhaseConfig,
  PhaseDimensionConfig,
  DimensionScore,
  WeightTier,
} from '@/types/greiner';

/**
 * Default model configuration.
 *
 * Targets and weights are derived a priori from the Greiner literature
 * (HBR 1972/1998 "Organizational Practices" table, esp. the Top-Management
 * Style row) — NOT calibrated to any reference candidates. See
 * iat-project/features/reveal14-Greiner/research/05-model-design-draft.md.
 *
 * Sign convention: negative target = left pole, positive = right pole.
 * Phase 6 (Alliances) is theory-extrapolated (Greiner has no table for it).
 */

export const DIMENSION_IDS: DimensionId[] = [
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

type Cell = [DimensionScore, WeightTier, string];

/** Build a full 14-dimension phase, defaulting unset dimensions to Neutral. */
function phase(
  phaseId: GreinerPhase,
  phaseName: string,
  phaseLabel: string,
  overrides: Partial<Record<DimensionId, Cell>>,
  extrapolated = false,
): PhaseConfig {
  const dimensions = {} as Record<DimensionId, PhaseDimensionConfig>;
  for (const id of DIMENSION_IDS) {
    const o = overrides[id];
    dimensions[id] = o
      ? { target: o[0], weight: o[1], rationale: o[2] }
      : { target: 0, weight: 'Neutral', rationale: 'Not distinguishing for this phase' };
  }
  return { phaseId, phaseName, phaseLabel, extrapolated, dimensions };
}

const PHASES: Record<GreinerPhase, PhaseConfig> = {
  Creativity: phase('Creativity', 'Creativity', 'Creativity — Speed & Innovation', {
    innovative_structured:    [-3, 'Critical',   'Innovation/experimentation is the core of the phase'],
    decisive_deliberate:      [-2, 'Critical',   'Fast action, cut through under uncertainty'],
    careful_flexible:         [ 2, 'Critical',   'Improvisation over process discipline'],
    adaptive_consistent:      [-2, 'Critical',   'Pivot and recover from setbacks'],
    open_principled:          [-2, 'Critical',   'Openness accelerates learning'],
    analytical_intuitive:     [ 2, 'Supporting', 'Fast meaning-making under uncertainty (intuitive)'],
    collaborative_independent:[ 1, 'Supporting', 'Founder autonomy / ownership'],
    integrity_contextual:     [ 1, 'Supporting', 'Pragmatic, situational action'],
    conceptual_practical:     [ 1, 'Supporting', '"Make and sell" — bias to action (founders also need vision)'],
    assertive_reflective:     [-1, 'Supporting', 'Some assertiveness to create direction'],
    persuasive_dialogue:      [-1, 'Supporting', 'Win early customers / investors'],
    performance_sustainable:  [-1, 'Supporting', 'Drive sustains momentum'],
  }),

  Direction: phase('Direction', 'Direction', 'Direction — Structure & Control', {
    analytical_intuitive:     [-2, 'Critical',   'Structuring needs evidence and ordering'],
    decisive_deliberate:      [-2, 'Critical',   'Choices must be pushed through'],
    assertive_reflective:     [-2, 'Critical',   'Directive leadership = explicit steering'],
    careful_flexible:         [-2, 'Critical',   'Professionalization needs reliability'],
    open_principled:          [ 2, 'Critical',   'Consistency prevents arbitrariness'],
    conceptual_practical:     [-1, 'Supporting', 'Overview helps design roles/structure'],
    persuasive_dialogue:      [-1, 'Supporting', 'Persuasion drives acceptance'],
    performance_sustainable:  [-1, 'Supporting', 'Goal-driven execution'],
    adaptive_consistent:      [ 1, 'Supporting', 'Consistency establishes routines'],
    stable_expressive:        [-1, 'Supporting', 'Composure supports authority'],
    integrity_contextual:     [-1, 'Supporting', 'Norms help professionalize'],
    innovative_structured:    [ 1, 'Supporting', 'Structure sets frameworks'],
  }),

  Delegation: phase('Delegation', 'Delegation', 'Delegation — Autonomy & Trust', {
    persuasive_dialogue:      [ 2, 'Critical',   'Alignment prevents resistance; delegating leaders align, not command'],
    performance_sustainable:  [-2, 'Critical',   'Output/result focus keeps decentralization productive'],
    stable_expressive:        [-2, 'Critical',   'Stability prevents falling back into control'],
    collaborative_independent:[-1, 'Critical',   'Letting go requires trust/cooperation over control (could argue +Independent)'],
    decisive_deliberate:      [-1, 'Supporting', 'Prevents delay, but mostly empowers others'],
    assertive_reflective:     [ 1, 'Supporting', 'Listening / managing at a distance'],
    sociable_reserved:        [-1, 'Supporting', 'Supports remote management'],
    careful_flexible:         [-1, 'Supporting', 'Reliability secures agreements'],
    adaptive_consistent:      [-1, 'Supporting', 'Adaptation helps letting go'],
    integrity_contextual:     [ 1, 'Supporting', 'Tailored, local judgment'],
    open_principled:          [-1, 'Supporting', 'Supports local solutions'],
  }),

  Coordination: phase('Coordination', 'Coordination', 'Coordination — Systems & Efficiency', {
    careful_flexible:         [-3, 'Critical',   'Error reduction demands rigor'],
    analytical_intuitive:     [-2, 'Critical',   'System optimization needs analysis'],
    adaptive_consistent:      [ 2, 'Critical',   'Standardization across the organization'],
    innovative_structured:    [ 2, 'Critical',   'Process discipline'],
    open_principled:          [ 2, 'Critical',   'Rule-adherence keeps systems standing'],
    conceptual_practical:     [ 1, 'Supporting', 'Practical implementation matters'],
    performance_sustainable:  [ 1, 'Supporting', 'Long-term over short-term'],
    stable_expressive:        [-1, 'Supporting', 'Calm supports control'],
    collaborative_independent:[-1, 'Supporting', 'Coordination/alignment across units'],
    integrity_contextual:     [-1, 'Supporting', 'Principles prevent opportunism'],
  }),

  Collaboration: phase('Collaboration', 'Collaboration', 'Collaboration — Alignment & Adaptivity', {
    persuasive_dialogue:      [ 2, 'Critical',   'Co-creation through dialogue'],
    collaborative_independent:[-2, 'Critical',   'Collaboration is the core of the phase'],
    adaptive_consistent:      [-2, 'Critical',   'Team dynamics demand adaptivity'],
    open_principled:          [-2, 'Critical',   'Agility and open-mindedness'],
    conceptual_practical:     [-1, 'Supporting', 'Shared overview helps cross-functional work'],
    decisive_deliberate:      [ 1, 'Supporting', 'Reflective team decisions over impulsive ones'],
    assertive_reflective:     [ 1, 'Supporting', 'Listening; skillful confrontation of differences'],
    sociable_reserved:        [-1, 'Supporting', 'Team interaction'],
    careful_flexible:         [ 1, 'Supporting', 'Agile teamwork'],
    stable_expressive:        [-1, 'Supporting', 'Self-regulation underpins psychological safety'],
    integrity_contextual:     [ 1, 'Supporting', 'Situational, tailored judgment'],
    innovative_structured:    [-1, 'Supporting', '"Problem solving and innovation"'],
  }),

  Alliances: phase('Alliances', 'Alliances', 'Alliances — External Focus & Influence', {
    conceptual_practical:     [-2, 'Critical',   'Ecosystems need systems/strategic thinking'],
    sociable_reserved:        [-2, 'Critical',   'Relationship and network building'],
    persuasive_dialogue:      [-2, 'Critical',   'Partnerships need external influence (persuasive pole)'],
    adaptive_consistent:      [-2, 'Critical',   'External complexity demands adaptivity'],
    open_principled:          [-2, 'Critical',   'Integrate external interests; open-mindedness'],
    assertive_reflective:     [-1, 'Supporting', 'Take a position in negotiations'],
    performance_sustainable:  [ 1, 'Supporting', 'Long-term partnerships'],
    stable_expressive:        [-1, 'Supporting', 'Composure in negotiation'],
    integrity_contextual:     [ 1, 'Supporting', 'Weigh competing interests'],
    innovative_structured:    [-1, 'Supporting', 'New business / partnering models'],
  }, true),
};

export const PHASE_ORDER: GreinerPhase[] = [
  'Creativity',
  'Direction',
  'Delegation',
  'Coordination',
  'Collaboration',
  'Alliances',
];

export const DEFAULT_BANDS = [
  { min: 75, label: 'Sterke fit' },
  { min: 55, label: 'Goede fit' },
  { min: 40, label: 'Risicofit' },
  { min: 0,  label: 'Mismatch' },
];

export const DEFAULT_CONFIG: ModelConfig = {
  version: 1,
  phases: PHASES,
  bands: DEFAULT_BANDS,
  scoring: {
    wrongPolePenalty: 0,
    floorNormalize: true,
  },
};

/** Deep clone so consumers never mutate the frozen default. */
export function cloneDefaultConfig(): ModelConfig {
  return structuredClone(DEFAULT_CONFIG);
}
