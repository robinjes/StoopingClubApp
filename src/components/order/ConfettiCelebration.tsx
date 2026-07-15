import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 52;
const CONFETTI_COLORS = [
  '#58CC02',
  '#FF9600',
  '#1CB0F6',
  '#FF4B4B',
  '#CE82FF',
  '#FFC800',
  '#3B6D11',
];

type ParticleConfig = {
  id: number;
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  rotationEnd: number;
  isCircle: boolean;
};

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function buildParticles(): ParticleConfig[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const rand = (offset: number) => seededRandom(index + offset);

    return {
      id: index,
      left: rand(1) * SCREEN_WIDTH,
      size: 6 + rand(2) * 6,
      color: CONFETTI_COLORS[Math.floor(rand(3) * CONFETTI_COLORS.length)],
      delay: rand(4) * 450,
      duration: 2200 + rand(5) * 1800,
      drift: (rand(6) - 0.5) * 140,
      rotationEnd: (rand(7) - 0.5) * 720,
      isCircle: rand(8) > 0.55,
    };
  });
}

function ConfettiParticle({ config }: { config: ParticleConfig }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withTiming(1, { duration: config.duration, easing: Easing.out(Easing.quad) }),
    );
  }, [config.delay, config.duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.7 ? 1 : 1 - (progress.value - 0.7) / 0.3,
    transform: [
      { translateY: -50 + progress.value * (SCREEN_HEIGHT * 0.55) },
      { translateX: config.drift * progress.value },
      { rotate: `${config.rotationEnd * progress.value}deg` },
      { scale: 0.5 + progress.value * 0.5 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: config.left,
          width: config.size,
          height: config.isCircle ? config.size : config.size * 1.7,
          borderRadius: config.isCircle ? config.size / 2 : 2,
          backgroundColor: config.color,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function ConfettiCelebration() {
  const particles = useMemo(() => buildParticles(), []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} config={particle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});
