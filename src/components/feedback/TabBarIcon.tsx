import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const BOUNCE_SPRING = { damping: 11, stiffness: 380, mass: 0.55 };

type TabBarIconProps = {
  name: IoniconName;
  color: string;
  isFocused: boolean;
};

export default function TabBarIcon({ name, color, isFocused }: TabBarIconProps) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      scale.value = withSequence(
        withSpring(1.14, BOUNCE_SPRING),
        withSpring(1.06, { damping: 14, stiffness: 300 }),
      );
      lift.value = withSpring(-2, { damping: 16, stiffness: 280 });
    } else {
      scale.value = withSpring(1, BOUNCE_SPRING);
      lift.value = withSpring(0, { damping: 16, stiffness: 280 });
    }
  }, [isFocused, lift, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={iconStyle}>
      <Ionicons name={name} size={28} color={color} />
    </Animated.View>
  );
}
