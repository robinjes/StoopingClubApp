import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import AnimatedPressable from './AnimatedPressable';
import { useFeedback } from '../../context/FeedbackContext';
import { useTheme } from '../../context/ThemeContext';
import type { CartLine } from '../../services/shopify/types';
import { formatPrice } from '../../utils/formatPrice';

type CartItemRowProps = {
  line: CartLine;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
};

export default function CartItemRow({ line, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const { colors } = useTheme();
  const { haptic, sound } = useFeedback();
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = 1;
    scale.value = 1;
  }, [line.id, opacity, scale]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  function handleRemove() {
    haptic('light');
    sound('slideOut');
    opacity.value = withTiming(0, { duration: 220 });
    scale.value = withTiming(0.88, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(onRemove)(line.id);
      }
    });
  }

  return (
    <Animated.View
      style={rowStyle}
      className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
    >
      <View className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
        {line.imageUrl ? (
          <Image source={{ uri: line.imageUrl }} className="h-full w-full" />
        ) : null}
      </View>

      <View className="ml-3 flex-1">
        <Text className="font-medium text-gray-900 dark:text-gray-100" numberOfLines={2}>
          {line.title}
        </Text>
        <Text className="mt-1 text-sm font-semibold" style={{ color: colors.brand }}>
          {formatPrice(line.price)}
        </Text>

        <View className="mt-2 flex-row items-center gap-3">
          <AnimatedPressable
            haptic="selection"
            pressedScale={0.9}
            className="h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800"
            onPress={() => void onUpdateQuantity(line.id, Math.max(1, line.quantity - 1))}
          >
            <Text className="text-base text-gray-700 dark:text-gray-300">−</Text>
          </AnimatedPressable>
          <Text className="min-w-[20px] text-center text-sm font-medium">{line.quantity}</Text>
          <AnimatedPressable
            haptic="selection"
            pressedScale={0.9}
            className="h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800"
            onPress={() => void onUpdateQuantity(line.id, line.quantity + 1)}
          >
            <Text className="text-base text-gray-700 dark:text-gray-300">+</Text>
          </AnimatedPressable>
          <AnimatedPressable haptic="light" pressedScale={0.95} className="ml-auto" onPress={handleRemove}>
            <Text className="text-sm text-red-600">Remove</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  );
}
