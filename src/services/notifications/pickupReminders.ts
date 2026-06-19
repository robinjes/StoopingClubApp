import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getCurrentPickupSite } from '../../data/pickupSeason';

export const FRIDAY_ORDER_REMINDER_ID = 'friday-order-reminder';
export const SUNDAY_PICKUP_REMINDER_ID = 'sunday-pickup-reminder';
const REMINDER_CHANNEL_ID = 'pickup-reminders';

const FRIDAY_HOUR = 17;
const FRIDAY_MINUTE = 0;
const SUNDAY_HOUR = 9;
const SUNDAY_MINUTE = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Pickup reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3B6D11',
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  await ensureAndroidChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function schedulePickupReminders(): Promise<void> {
  if (!Device.isDevice) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  await ensureAndroidChannel();

  const pickupSite = getCurrentPickupSite();

  await Notifications.cancelScheduledNotificationAsync(FRIDAY_ORDER_REMINDER_ID).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(SUNDAY_PICKUP_REMINDER_ID).catch(() => undefined);

  await Notifications.scheduleNotificationAsync({
    identifier: FRIDAY_ORDER_REMINDER_ID,
    content: {
      title: 'Confirm your order',
      body: `Place your Stooping Club order by tonight. This week's pickup is at ${pickupSite.name}.`,
      data: { type: 'friday-order-reminder', pickupSiteId: pickupSite.id },
      ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 6,
      hour: FRIDAY_HOUR,
      minute: FRIDAY_MINUTE,
      ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
    },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: SUNDAY_PICKUP_REMINDER_ID,
    content: {
      title: 'Pickup day',
      body: `Head to ${pickupSite.name} today to collect your Stooping Club order.`,
      data: { type: 'sunday-pickup-reminder', pickupSiteId: pickupSite.id },
      ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,
      hour: SUNDAY_HOUR,
      minute: SUNDAY_MINUTE,
      ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
    },
  });
}

export async function initializePickupReminders(): Promise<boolean> {
  const granted = await requestNotificationPermissions();
  if (!granted) {
    return false;
  }

  await schedulePickupReminders();
  return true;
}

export type PickupReminderResult =
  | { ok: true }
  | { ok: false; reason: 'simulator' | 'permission_denied'; message: string };

export async function sendTestPickupReminderNotification(): Promise<PickupReminderResult> {
  if (!Device.isDevice) {
    return {
      ok: false,
      reason: 'simulator',
      message: 'Pickup reminders need a physical device to show as notifications.',
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
      message: 'Allow notifications to receive pickup reminders.',
    };
  }

  await ensureAndroidChannel();

  const pickupSite = getCurrentPickupSite();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Pickup day',
      body: `Head to ${pickupSite.name} today to collect your Stooping Club order.`,
      data: { type: 'sunday-pickup-reminder', pickupSiteId: pickupSite.id, test: true },
      ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  });

  return { ok: true };
}
