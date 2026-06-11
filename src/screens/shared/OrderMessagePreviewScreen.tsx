import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import OrderMessageCard from '../../components/order/OrderMessageCard';
import ScreenLayout from '../../components/layout/ScreenLayout';
import type { HomeStackParamList } from '../../navigation/stacks/HomeStack';
import { useTheme } from '../../context/ThemeContext';
import { buildOrderMessage } from '../../utils/orderMessage';

type OrderMessagePreviewScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'OrderMessagePreview'
>;

export default function OrderMessagePreviewScreen({ route }: OrderMessagePreviewScreenProps) {
  const { colors } = useTheme();
  const { items, orderedAt } = route.params;

  const message = useMemo(
    () => buildOrderMessage(items, new Date(orderedAt)),
    [items, orderedAt],
  );

  return (
    <ScreenLayout showBack>
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-2xl text-gray-900 dark:text-gray-100"
          style={{ fontFamily: 'Georgia', color: colors.brand }}
        >
          Order message preview
        </Text>
        <Text className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-400">
          This is what customers see right after checkout. Edit copy in{' '}
          <Text className="font-medium">src/data/orderMessageTemplate.ts</Text>.
        </Text>

        <View className="mt-6">
          <OrderMessageCard message={message} />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
