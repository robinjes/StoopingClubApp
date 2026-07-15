import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../context/ThemeContext';

export default function CheckoutSuccessIcon() {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    progress.value = withSequence(
      withSpring(1, { damping: 14, stiffness: 220 }),
      withDelay(900, withTiming(0, { duration: 280 })),
    );
    glow.value = withSequence(
      withTiming(1, { duration: 320 }),
      withDelay(700, withTiming(0, { duration: 400 })),
    );
  }, [glow, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15, 1], [0, 1, 1]),
    transform: [{ scale: 0.7 + progress.value * 0.3 }],
  }));

  const cartStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: 1 - progress.value * 0.2 }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.5 + progress.value * 0.5 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.45,
    transform: [{ scale: 1 + glow.value * 0.35 }],
  }));

  return (
    <Animated.View style={containerStyle} className="mb-2 items-center">
      <View className="h-16 w-16 items-center justify-center">
        <Animated.View
          pointerEvents="none"
          style={[
            glowStyle,
            {
              position: 'absolute',
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.brand,
            },
          ]}
        />
        <Animated.View style={[{ position: 'absolute' }, cartStyle]}>
          <Ionicons name="cart" size={40} color={colors.brand} />
        </Animated.View>
        <Animated.View style={checkStyle}>
          <Ionicons name="checkmark-circle" size={44} color={colors.brand} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}
