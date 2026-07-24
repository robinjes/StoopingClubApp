import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import AnimatedPressable from './AnimatedPressable';
import { useFlyToCart } from '../../context/FlyToCartContext';

const HEADER_GREEN = '#00553A';

type CartIconButtonProps = {
  itemCount: number;
  onPress: () => void;
};

export default function CartIconButton({ itemCount, onPress }: CartIconButtonProps) {
  const cartRef = useRef<View>(null);
  const { registerCartTarget, cartPulse, cartSparkle, badgeBump } = useFlyToCart();

  useEffect(() => {
    registerCartTarget(
      () => {
        const cartNode = cartRef.current;
        if (!cartNode) {
          return Promise.resolve(null);
        }

        return new Promise((resolve) => {
          cartNode.measureInWindow((x, y, width, height) => {
            resolve(width > 0 ? { x, y, width, height } : null);
          });
        });
      },
    );
  }, [registerCartTarget]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartPulse.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: cartSparkle.value * 0.85,
    transform: [{ scale: 0.8 + cartSparkle.value * 0.5 }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeBump.value }],
  }));

  return (
    <AnimatedPressable
      haptic="selection"
      pressedScale={0.9}
      accessibilityRole="button"
      accessibilityLabel="Cart"
      className="p-1"
      onPress={onPress}
    >
      <Animated.View ref={cartRef} style={iconStyle}>
        <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
        <Animated.View pointerEvents="none" style={[sparkleStyle, { position: 'absolute', inset: -6 }]}>
          <View
            style={{
              flex: 1,
              borderRadius: 999,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.65)',
            }}
          />
        </Animated.View>
        {itemCount > 0 ? (
          <Animated.View
            style={badgeStyle}
            className="absolute -right-2 -top-1 min-w-[16px] items-center rounded-full bg-white px-1"
          >
            <Text style={{ color: HEADER_GREEN, fontSize: 10, fontWeight: '600' }}>
              {itemCount > 9 ? '9+' : itemCount}
            </Text>
          </Animated.View>
        ) : null}
      </Animated.View>
    </AnimatedPressable>
  );
}
