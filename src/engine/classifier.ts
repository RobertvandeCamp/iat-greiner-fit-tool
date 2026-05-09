import { Classification } from '@/types/greiner';

export function classify(fitPercent: number): Classification {
  if (fitPercent >= 67) return 'Strong';
  if (fitPercent >= 50) return 'Usable';
  if (fitPercent >= 34) return 'Risk';
  return 'Mismatch';
}
