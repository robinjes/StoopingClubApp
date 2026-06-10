import { useEffect } from 'react';
import { AppState } from 'react-native';

import { initializePickupReminders, schedulePickupReminders } from '../services/notifications/pickupReminders';

export function usePickupReminders(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    void initializePickupReminders();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void schedulePickupReminders();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled]);
}
