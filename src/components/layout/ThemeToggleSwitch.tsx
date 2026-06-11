import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { ThemeColors } from '../../theme/colors';

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;
const TRACK_PADDING = 3;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 220,
  mass: 0.6,
};

type ThemeToggleSwitchProps = {
  isDark: boolean;
  colors: ThemeColors;
  onToggle: () => void;
};

export default function ThemeToggleSwitch({ isDark, colors, onToggle }: ThemeToggleSwitchProps) {
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isDark ? 1 : 0, SPRING_CONFIG);
  }, [isDark, progress]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * THUMB_TRAVEL }],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, colors.brandDark],
    ),
  }));

  const sunStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.55,
  }));

  const moonDarkStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  const moonLightStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="mt-3 flex-row items-center justify-between rounded-full px-4 py-2.5"
      style={{ backgroundColor: colors.surfaceMuted }}
      onPress={onToggle}
    >
      <Text className="text-sm font-medium" style={{ color: colors.text }}>
        {isDark ? 'Dark mode' : 'Light mode'}
      </Text>

      <Animated.View
        style={[
          {
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            padding: TRACK_PADDING,
            justifyContent: 'center',
          },
          trackStyle,
        ]}
      >
        <View className="absolute inset-0 flex-row items-center justify-between px-2">
          <Animated.View style={sunStyle}>
            <Ionicons name="sunny-outline" size={14} color="#FFFFFF" />
          </Animated.View>
          <View className="h-[14px] w-[14px] items-center justify-center">
            <Animated.View style={[{ position: 'absolute' }, moonDarkStyle]}>
              <Ionicons name="moon-outline" size={14} color={colors.brandDark} />
            </Animated.View>
            <Animated.View style={moonLightStyle}>
              <Ionicons name="moon-outline" size={14} color="#FFFFFF" />
            </Animated.View>
          </View>
        </View>

        <Animated.View
          style={[
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: colors.background,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000000',
              shadowOpacity: 0.15,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              elevation: 2,
            },
            thumbStyle,
          ]}
        >
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={14}
            color={isDark ? colors.brand : colors.brandDark}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
