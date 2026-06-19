import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import { ORDER_MESSAGE_TEST_ITEMS } from '../../data/orderMessageTemplate';
import { navigateToOrderMessagePreview } from '../../navigation/rootNavigation';
import { sendTestOrderConfirmationMessage } from '../../services/notifications/orderConfirmation';
import { sendTestPickupReminderNotification } from '../../services/notifications/pickupReminders';
import { useTheme } from '../../context/ThemeContext';

export default function DevNotificationTestButtons() {
  const { colors } = useTheme();
  const [isTestingOrderMessage, setIsTestingOrderMessage] = useState(false);
  const [isTestingPickupReminder, setIsTestingPickupReminder] = useState(false);

  async function handleTestOrderMessage() {
    setIsTestingOrderMessage(true);

    const items = ORDER_MESSAGE_TEST_ITEMS.map((item) => ({
      title: item.title,
      quantity: item.quantity,
    }));
    const orderedAt = new Date().toISOString();

    const result = await sendTestOrderConfirmationMessage();

    navigateToOrderMessagePreview({ items, orderedAt });

    if (result.ok) {
      Alert.alert('Test scheduled', 'A sample order confirmation will appear in about 1 second.');
    } else {
      Alert.alert('Could not send test', result.message);
    }

    setIsTestingOrderMessage(false);
  }

  async function handleTestPickupReminder() {
    setIsTestingPickupReminder(true);

    const result = await sendTestPickupReminderNotification();

    if (result.ok) {
      Alert.alert('Test scheduled', 'A sample pickup reminder will appear in about 1 second.');
    } else {
      Alert.alert('Could not send test', result.message);
    }

    setIsTestingPickupReminder(false);
  }

  return (
    <View className="flex-row items-center gap-1">
      <DevTestButton
        accessibilityLabel="Test order confirmation message"
        icon="receipt-outline"
        colors={colors}
        isLoading={isTestingOrderMessage}
        onPress={() => void handleTestOrderMessage()}
      />
      <DevTestButton
        accessibilityLabel="Test pickup reminder notification"
        icon="notifications-outline"
        colors={colors}
        isLoading={isTestingPickupReminder}
        onPress={() => void handleTestPickupReminder()}
      />
    </View>
  );
}

type DevTestButtonProps = {
  accessibilityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: ReturnType<typeof useTheme>['colors'];
  isLoading: boolean;
  onPress: () => void;
};

function DevTestButton({
  accessibilityLabel,
  icon,
  colors,
  isLoading,
  onPress,
}: DevTestButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-8 w-8 items-center justify-center rounded-full border"
      style={{ borderColor: colors.border, opacity: isLoading ? 0.6 : 1 }}
      disabled={isLoading}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.brand} />
      ) : (
        <Ionicons name={icon} size={16} color={colors.textMuted} />
      )}
    </Pressable>
  );
}
