import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useStreakStore } from '../store/streakStore';

export function useStreakTracking(enabled: boolean): void {
  const isHydrated = useStreakStore((state) => state.isHydrated);
  const recordAppOpen = useStreakStore((state) => state.recordAppOpen);

  useEffect(() => {
    if (!enabled || !isHydrated) {
      return;
    }

    void recordAppOpen();
  }, [enabled, isHydrated, recordAppOpen]);

  useEffect(() => {
    if (!enabled || !isHydrated) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void recordAppOpen();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, isHydrated, recordAppOpen]);
}
