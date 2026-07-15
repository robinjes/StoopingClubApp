import { Image, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useFlyToCart } from '../../context/FlyToCartContext';

function bezierPoint(t: number, p0: number, p1: number, p2: number, p3: number) {
  'worklet';
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

export default function FlyToCartOverlay() {
  const { flyingImageUrl, isFlying, flightProgress, flyFrom, flyTo } = useFlyToCart();

  const animatedStyle = useAnimatedStyle(() => {
    const from = flyFrom.value;
    const target = flyTo.value;

    if (from.width <= 0) {
      return { opacity: 0, width: 0, height: 0 };
    }

    const startX = from.x + from.width / 2;
    const startY = from.y + from.height / 2;
    const endX = target.x + target.width / 2;
    const endY = target.y + target.height / 2;

    const t = flightProgress.value;
    const controlY = Math.min(startY, endY) - 80;

    const x = bezierPoint(t, startX, startX, endX, endX);
    const y = bezierPoint(t, startY, controlY, controlY, endY);
    const size = Math.max(8, from.width * (1 - t * 0.72));
    const lift = 1 + Math.sin(t * Math.PI) * 0.08;

    return {
      opacity: Math.max(0, 1 - t * 1.05),
      transform: [
        { translateX: x - size / 2 },
        { translateY: y - size / 2 },
        { scale: lift * (1 - t * 0.25) },
      ],
      width: size,
      height: size,
    };
  });

  if (!isFlying) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View style={[styles.flyer, animatedStyle]}>
        {flyingImageUrl ? (
          <Image source={{ uri: flyingImageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
  flyer: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#D1D5DB',
  },
});
