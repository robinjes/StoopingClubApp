import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import ConfettiCelebration from '../../components/order/ConfettiCelebration';
import OrderCelebrationHero from '../../components/order/OrderCelebrationHero';
import OrderMessageCard from '../../components/order/OrderMessageCard';
import CheckoutSuccessIcon from '../../components/feedback/CheckoutSuccessIcon';
import AnimatedPressable from '../../components/feedback/AnimatedPressable';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { useFeedback } from '../../context/FeedbackContext';
import { useOverlay } from '../../context/OverlayContext';
import type { CartStackParamList } from '../../navigation/stacks/CartStack';
import { navigateToShopTab } from '../../navigation/rootNavigation';
import { useTheme } from '../../context/ThemeContext';
import { buildOrderMessage } from '../../utils/orderMessage';

type OrderConfirmationScreenProps = NativeStackScreenProps<CartStackParamList, 'OrderConfirmation'>;

export default function OrderConfirmationScreen({ navigation, route }: OrderConfirmationScreenProps) {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
  const { haptic, sound } = useFeedback();
  const { items, orderedAt } = route.params;

  useEffect(() => {
    haptic('success');
    sound('success');
  }, [haptic, sound]);

  const message = useMemo(
    () => buildOrderMessage(items, new Date(orderedAt)),
    [items, orderedAt],
  );

  return (
    <ScreenLayout>
      <View className="flex-1">
        <ConfettiCelebration />

        <ScrollView
          className="flex-1 px-4 pt-6"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
        >
          <CheckoutSuccessIcon />
          <OrderCelebrationHero message="Congratulations on your order!" />

          <Text className="mt-5 text-center text-base leading-6 text-gray-600 dark:text-gray-400">
            Your confirmation message is below. We also sent it as a notification.
          </Text>

        <View className="mt-6">
          <OrderMessageCard message={message} />
        </View>

        <View className="mt-6 gap-3">
          <AnimatedPressable
            haptic="medium"
            pressedScale={0.97}
            className="items-center rounded-xl py-4"
            style={{ backgroundColor: colors.brand }}
            onPress={() => {
              closeOverlay();
              navigateToShopTab();
            }}
          >
            <Text className="text-base font-semibold text-white">Back to shop</Text>
          </AnimatedPressable>

          <AnimatedPressable
            haptic="selection"
            pressedScale={0.98}
            className="items-center rounded-xl border py-4"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">View cart</Text>
          </AnimatedPressable>
        </View>
      </ScrollView>
      </View>
    </ScreenLayout>
  );
}
