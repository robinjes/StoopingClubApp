import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useFeedback } from '../../context/FeedbackContext';
import type { HapticStyle } from '../../services/feedback/haptics';

const PRESS_SPRING = { damping: 18, stiffness: 420, mass: 0.55 };

type AnimatedPressableProps = PressableProps & {
  children: ReactNode;
  haptic?: HapticStyle | null;
  pressedScale?: number;
  style?: StyleProp<ViewStyle>;
};

export default function AnimatedPressable({
  children,
  haptic = 'selection',
  pressedScale = 0.96,
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: AnimatedPressableProps) {
  const { haptic: triggerHaptic } = useFeedback();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={style}
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withSpring(pressedScale, PRESS_SPRING);
          if (haptic) {
            triggerHaptic(haptic);
          }
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, PRESS_SPRING);
        onPressOut?.(event);
      }}
    >
      <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>{children}</Animated.View>
    </Pressable>
  );
}
