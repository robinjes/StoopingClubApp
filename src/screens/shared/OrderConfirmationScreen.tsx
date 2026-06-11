import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import OrderMessageCard from '../../components/order/OrderMessageCard';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { useOverlay } from '../../context/OverlayContext';
import type { CartStackParamList } from '../../navigation/stacks/CartStack';
import { navigateToShopTab } from '../../navigation/rootNavigation';
import { useTheme } from '../../context/ThemeContext';
import { buildOrderMessage } from '../../utils/orderMessage';

type OrderConfirmationScreenProps = NativeStackScreenProps<CartStackParamList, 'OrderConfirmation'>;

export default function OrderConfirmationScreen({ navigation, route }: OrderConfirmationScreenProps) {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
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
        <View className="items-center">
          <View
            className="mb-5 h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.cardActive }}
          >
            <Ionicons name="checkmark-circle" size={48} color={colors.brand} />
          </View>

          <Text
            className="text-center text-2xl text-gray-900 dark:text-gray-100"
            style={{ fontFamily: 'Georgia' }}
          >
            Order confirmed
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-gray-600 dark:text-gray-400">
            Your confirmation message is below. We also sent it as a notification.
          </Text>
        </View>

        <View className="mt-6">
          <OrderMessageCard message={message} />
        </View>

        <View className="mt-6 gap-3">
          <Pressable
            className="items-center rounded-xl py-4"
            style={{ backgroundColor: colors.brand }}
            onPress={() => {
              closeOverlay();
              navigateToShopTab();
            }}
          >
            <Text className="text-base font-semibold text-white">Back to shop</Text>
          </Pressable>

          <Pressable
            className="items-center rounded-xl border py-4"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">View cart</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
