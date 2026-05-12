import { DimensionDef, DimensionId } from '@/types/greiner';

export const DIMENSIONS: DimensionDef[] = [
  { id: 'analytical_intuitive',      index: 0,  leftTrait: 'Analytical Thinking',          rightTrait: 'Intuitive Thinking',          shortLabel: 'Analytical vs Intuitive' },
  { id: 'conceptual_practical',      index: 1,  leftTrait: 'Conceptual Thinking',           rightTrait: 'Practical Thinking',          shortLabel: 'Conceptual vs Practical' },
  { id: 'decisive_deliberate',       index: 2,  leftTrait: 'Decisiveness',                  rightTrait: 'Deliberate Approach',         shortLabel: 'Decisive vs Deliberate' },
  { id: 'assertive_reflective',      index: 3,  leftTrait: 'Assertiveness',                 rightTrait: 'Reflective Communication',    shortLabel: 'Assertive vs Reflective' },
  { id: 'sociable_reserved',         index: 4,  leftTrait: 'Sociability',                   rightTrait: 'Reserved Interaction Style',  shortLabel: 'Sociable vs Reserved' },
  { id: 'persuasive_dialogue',       index: 5,  leftTrait: 'Persuasiveness',                rightTrait: 'Collaborative Discussion',    shortLabel: 'Persuasive vs Collaborative' },
  { id: 'performance_sustainable',   index: 6,  leftTrait: 'Achievement Drive',             rightTrait: 'Sustainable Approach',        shortLabel: 'Achievement vs Sustainable' },
  { id: 'careful_flexible',          index: 7,  leftTrait: 'Conscientiousness & Reliability', rightTrait: 'Flexible Execution',        shortLabel: 'Conscientious vs Flexible' },
  { id: 'adaptive_consistent',       index: 8,  leftTrait: 'Adaptability & Resilience',     rightTrait: 'Consistent Approach',         shortLabel: 'Adaptable vs Consistent' },
  { id: 'stable_expressive',         index: 9,  leftTrait: 'Emotional Control & Stability', rightTrait: 'Expressive Approach',         shortLabel: 'Controlled vs Expressive' },
  { id: 'collaborative_independent', index: 10, leftTrait: 'Agreeableness & Cooperation',   rightTrait: 'Independent Decision-Making', shortLabel: 'Cooperative vs Independent' },
  { id: 'integrity_contextual',      index: 11, leftTrait: 'Integrity & Ethical Awareness', rightTrait: 'Context-Based Reasoning',     shortLabel: 'Principled vs Contextual' },
  { id: 'innovative_structured',     index: 12, leftTrait: 'Innovation & Creativity',       rightTrait: 'Structured Thinking',         shortLabel: 'Innovative vs Structured' },
  { id: 'open_principled',           index: 13, leftTrait: 'Flexibility & Open-Mindedness', rightTrait: 'Principled Consistency',      shortLabel: 'Open vs Principled' },
];

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
