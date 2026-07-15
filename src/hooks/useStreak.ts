import { useStreakStore } from '../store/streakStore';

export function useStreak() {
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const longestStreak = useStreakStore((state) => state.longestStreak);
  const activeDates = useStreakStore((state) => state.activeDates);
  const frozenDates = useStreakStore((state) => state.frozenDates);
  const freezesAvailable = useStreakStore((state) => state.freezesAvailable);
  const brokenStreak = useStreakStore((state) => state.brokenStreak);
  const lastOpenDate = useStreakStore((state) => state.lastOpenDate);
  const isHydrated = useStreakStore((state) => state.isHydrated);
  const restoreStreak = useStreakStore((state) => state.restoreStreak);
  const dismissBrokenStreak = useStreakStore((state) => state.dismissBrokenStreak);

  return {
    currentStreak,
    longestStreak,
    activeDates,
    frozenDates,
    freezesAvailable,
    brokenStreak,
    lastOpenDate,
    isHydrated,
    restoreStreak,
    dismissBrokenStreak,
  };
}
