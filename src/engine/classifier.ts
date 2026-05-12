import { Classification } from '@/types/greiner';

export function classify(fitPercent: number): Classification {
  if (fitPercent >= 75) return 'Sterke fit';
  if (fitPercent >= 55) return 'Goede fit';
  if (fitPercent >= 40) return 'Risicofit';
  return 'Mismatch';
}
