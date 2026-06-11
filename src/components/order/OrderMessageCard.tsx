import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { OrderMessageContent } from '../../utils/orderMessage';
import { useTheme } from '../../context/ThemeContext';

type OrderMessageCardProps = {
  message: OrderMessageContent;
};

export default function OrderMessageCard({ message }: OrderMessageCardProps) {
  const { colors } = useTheme();
  return (
    <View
      className="rounded-2xl border px-4 py-4"
      style={{ borderColor: colors.brand, backgroundColor: colors.cardActive }}
    >
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="mail-outline" size={20} color={colors.brand} />
        <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.brand }}>
          Your confirmation message
        </Text>
      </View>

      <Text
        className="text-xl text-gray-900 dark:text-gray-100"
        style={{ fontFamily: 'Georgia' }}
      >
        {message.headline}
      </Text>

      <Text className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">{message.itemsIntro}</Text>
      <View className="mt-2 gap-1.5">
        {message.itemLines.map((line) => (
          <View key={line} className="flex-row items-start gap-2">
            <Text style={{ color: colors.brand }}>•</Text>
            <Text className="flex-1 text-sm leading-5 text-gray-800 dark:text-gray-200">{line}</Text>
          </View>
        ))}
      </View>

      <View
        className="mt-4 rounded-xl border px-3 py-3"
        style={{ borderColor: colors.border, backgroundColor: colors.background }}
      >
        <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">{message.pickupLine}</Text>
        <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">{message.pickupAddressLine}</Text>
      </View>

      <Text className="mt-4 text-sm leading-5 text-gray-600 dark:text-gray-400">{message.footer}</Text>
    </View>
  );
}
