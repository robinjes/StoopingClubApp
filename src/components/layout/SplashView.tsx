import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';

import { lightColors } from '../../theme/colors';

const STOOPY_IN_MS = 360;
const WELCOME_IN_MS = 480;
const HOLD_MS = 1400;
const FADE_OUT_MS = 380;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STOOPY_SIZE = Math.min(SCREEN_WIDTH * 0.34, 132);
const WELCOME_WIDTH = Math.min(SCREEN_WIDTH * 0.55, 220);

type SplashViewProps = {
  onFinish: () => void;
};

export default function SplashView({ onFinish }: SplashViewProps) {
  const sceneOpacity = useRef(new Animated.Value(1)).current;
  const stoopyOpacity = useRef(new Animated.Value(0)).current;
  const stoopyScale = useRef(new Animated.Value(0.72)).current;
  const stoopyShift = useRef(new Animated.Value(0)).current;
  const welcomeProgress = useRef(new Animated.Value(0)).current;
  const onFinishRef = useRef(onFinish);

  onFinishRef.current = onFinish;

  useEffect(() => {
    let cancelled = false;

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(stoopyOpacity, {
          toValue: 1,
          duration: STOOPY_IN_MS,
          useNativeDriver: true,
        }),
        Animated.spring(stoopyScale, {
          toValue: 1,
          damping: 12,
          stiffness: 180,
          mass: 0.75,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(stoopyShift, {
          toValue: 1,
          duration: WELCOME_IN_MS,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(welcomeProgress, {
            toValue: 1,
            duration: WELCOME_IN_MS,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(HOLD_MS),
      Animated.timing(sceneOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
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
  }, [sceneOpacity, stoopyOpacity, stoopyScale, stoopyShift, welcomeProgress]);

  return (
    <Animated.View style={[styles.container, { opacity: sceneOpacity }]}>
      <StatusBar style="dark" />
      <View style={styles.welcomeStage}>
        <Animated.View
          style={[
            styles.stoopyWrap,
            {
              opacity: stoopyOpacity,
              transform: [
                {
                  translateX: stoopyShift.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -Math.min(SCREEN_WIDTH * 0.33, 130)],
                  }),
                },
                { scale: stoopyScale },
              ],
            },
          ]}
        >
          <Image
            source={require('../../../assets/stoopy-order-celebration.png')}
            style={styles.stoopy}
            resizeMode="contain"
            accessibilityLabel="Stoopy with arms raised"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.messageWrap,
            {
              opacity: welcomeProgress,
              transform: [
                {
                  translateX: welcomeProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [32, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.message} numberOfLines={2}>
            Hi, I’m Stoopy, welcome{'\n'}to Stooping Club!
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: lightColors.cream,
  },
  welcomeStage: {
    height: 150,
    justifyContent: 'center',
  },
  stoopyWrap: {
    position: 'absolute',
    left: '50%',
    marginLeft: -STOOPY_SIZE / 2,
  },
  stoopy: {
    width: STOOPY_SIZE,
    height: STOOPY_SIZE,
  },
  messageWrap: {
    position: 'absolute',
    left: '50%',
    width: WELCOME_WIDTH,
    marginLeft: -50,
  },
  message: {
    color: lightColors.brand,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
    letterSpacing: -0.3,
  },
});
