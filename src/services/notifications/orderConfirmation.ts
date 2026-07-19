import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { OrderMessageItem } from '../../utils/orderMessage';
import { buildOrderMessage } from '../../utils/orderMessage';

const ORDER_CHANNEL_ID = 'order-confirmations';

export type OrderMessageResult =
  | { ok: true }
  | { ok: false; reason: 'simulator' | 'permission_denied'; message: string };

async function ensureOrderChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ORDER_CHANNEL_ID, {
    name: 'Order confirmations',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3B6D11',
  });
}

export async function sendOrderConfirmationMessage(
  items: OrderMessageItem[],
  orderDate = new Date(),
): Promise<OrderMessageResult> {
  if (!Device.isDevice) {
    return {
      ok: false,
      reason: 'simulator',
      message: 'Order messages need a physical device to show as notifications.',
    };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return {
      ok: false,
      reason: 'permission_denied',
      message: 'Allow notifications to receive order confirmation messages.',
    };
  }

  await ensureOrderChannel();

  const message = buildOrderMessage(items, orderDate);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.notificationTitle,
      body: message.notificationBody,
      data: { type: 'order-confirmation' },
      ...(Platform.OS === 'android' ? { channelId: ORDER_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  });

  return { ok: true };
}
