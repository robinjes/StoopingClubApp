import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';

const FADE_IN_MS = 500;
const HOLD_MS = 1500;
const FADE_OUT_MS = 500;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOGO_WIDTH = Math.min(SCREEN_WIDTH * 0.88, 420);
const LOGO_HEIGHT = LOGO_WIDTH * 0.42;

type SplashViewProps = {
  onFinish: () => void;
};

export default function SplashView({ onFinish }: SplashViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const onFinishRef = useRef(onFinish);

  onFinishRef.current = onFinish;

  useEffect(() => {
    let cancelled = false;

    const animation = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: false,
      }),
      Animated.delay(HOLD_MS),
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: false,
      }),
    ]);

    const startTimer = setTimeout(() => {
      animation.start(({ finished }) => {
        if (finished && !cancelled) {
          onFinishRef.current();
        }
      });
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <StatusBar style="dark" />
      <Image
        source={require('../../../assets/stoopingclublogo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Stooping Club"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
});
