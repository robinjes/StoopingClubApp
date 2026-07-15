import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function safeImpact(style: Haptics.ImpactFeedbackStyle) {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Haptics.impactAsync(style);
  } catch {
    // Haptics unavailable — visual feedback only.
  }
}

async function safeNotification(type: Haptics.NotificationFeedbackType) {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Haptics.notificationAsync(type);
  } catch {
    // Haptics unavailable.
  }
}

async function safeSelection() {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Haptics.selectionAsync();
  } catch {
    // Haptics unavailable.
  }
}

export const haptics = {
  selection: () => void safeSelection(),
  light: () => void safeImpact(Haptics.ImpactFeedbackStyle.Light),
  medium: () => void safeImpact(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => void safeImpact(Haptics.ImpactFeedbackStyle.Heavy),
  rigid: () => void safeImpact(Haptics.ImpactFeedbackStyle.Rigid),
  soft: () => void safeImpact(Haptics.ImpactFeedbackStyle.Soft),
  success: () => void safeNotification(Haptics.NotificationFeedbackType.Success),
  warning: () => void safeNotification(Haptics.NotificationFeedbackType.Warning),
  error: () => void safeNotification(Haptics.NotificationFeedbackType.Error),
};

export type HapticStyle =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'rigid'
  | 'soft'
  | 'success'
  | 'warning'
  | 'error';

export function triggerHaptic(style: HapticStyle) {
  haptics[style]();
}
