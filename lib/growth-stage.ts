export function growthStageFromStreak(streak: number): 0 | 1 | 2 | 3 {
  if (streak >= 14) return 3;
  if (streak >= 7) return 2;
  if (streak >= 3) return 1;
  return 0;
}
