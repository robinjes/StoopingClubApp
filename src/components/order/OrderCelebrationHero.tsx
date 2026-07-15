import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '../../context/ThemeContext';

const STOOPY_SIZE = 132;
const POP_SPRING = { damping: 11, stiffness: 170, mass: 0.75 };

type OrderCelebrationHeroProps = {
  message: string;
};

export default function OrderCelebrationHero({ message }: OrderCelebrationHeroProps) {
  const { colors } = useTheme();
  const stoopyProgress = useSharedValue(0);
  const bubbleProgress = useSharedValue(0);

  useEffect(() => {
    stoopyProgress.value = withSpring(1, POP_SPRING);
    bubbleProgress.value = withDelay(380, withSpring(1, { damping: 14, stiffness: 210 }));
  }, [bubbleProgress, stoopyProgress]);

  const stoopyStyle = useAnimatedStyle(() => ({
    opacity: stoopyProgress.value,
    transform: [
      { translateY: (1 - stoopyProgress.value) * 90 },
      { scale: 0.25 + stoopyProgress.value * 0.75 },
    ],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubbleProgress.value,
    transform: [
      { translateY: (1 - bubbleProgress.value) * 16 },
      { scale: 0.82 + bubbleProgress.value * 0.18 },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bubbleWrap, bubbleStyle]}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              shadowOpacity: colors.background === '#FFFFFF' ? 0.12 : 0.28,
            },
          ]}
        >
          <Text style={[styles.bubbleText, { color: colors.text }]}>{message}</Text>
        </View>
        <View
          style={[
            styles.bubbleTail,
            {
              backgroundColor: colors.background,
              borderLeftColor: colors.border,
              borderBottomColor: colors.border,
            },
          ]}
        />
      </Animated.View>

      <Animated.View style={stoopyStyle}>
        <Image
          source={require('../../../assets/stoopylogo.png')}
          style={{ width: STOOPY_SIZE, height: STOOPY_SIZE }}
          resizeMode="contain"
          accessibilityLabel="Celebrating Stoopy"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 8,
    zIndex: 2,
  },
  bubbleWrap: {
    position: 'relative',
    marginBottom: 10,
    maxWidth: 280,
  },
  bubble: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 12,
    height: 12,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '-45deg' }],
  },
});
