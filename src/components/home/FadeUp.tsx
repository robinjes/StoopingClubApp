import type { ReactNode } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

type FadeUpProps = {
  children: ReactNode;
  animationKey: number;
  delay?: number;
};

export default function FadeUp({ children, animationKey, delay = 0 }: FadeUpProps) {
  return (
    <Animated.View
      key={`fade-up-${animationKey}-${delay}`}
      entering={FadeInUp.duration(650).delay(delay)}
    >
      {children}
    </Animated.View>
  );
}
