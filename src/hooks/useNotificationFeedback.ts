import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { useFeedback } from '../context/FeedbackContext';
import {
  FRIDAY_ORDER_REMINDER_ID,
  SUNDAY_PICKUP_REMINDER_ID,
} from '../services/notifications/pickupReminders';

export function useNotificationFeedback(enabled: boolean): void {
  const { haptic, sound } = useFeedback();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const id = notification.request.identifier;

      if (id === SUNDAY_PICKUP_REMINDER_ID) {
        haptic('light');
        sound('notification');
        return;
      }

      if (id === FRIDAY_ORDER_REMINDER_ID) {
        haptic('selection');
        sound('notification');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, haptic, sound]);
}
