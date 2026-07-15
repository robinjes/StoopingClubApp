import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { type View as ViewType } from 'react-native';
import {
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

import { useFeedback } from './FeedbackContext';

export type LayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FlyPayload = {
  imageUrl: string | null;
  from: LayoutRect;
};

type MeasureTarget = () => Promise<LayoutRect | null>;

type FlyToCartContextValue = {
  cartPulse: SharedValue<number>;
  cartSparkle: SharedValue<number>;
  badgeBump: SharedValue<number>;
  flightProgress: SharedValue<number>;
  flyFrom: SharedValue<LayoutRect>;
  flyTo: SharedValue<LayoutRect>;
  flyingImageUrl: string | null;
  isFlying: boolean;
  registerCartTarget: (measure: MeasureTarget) => void;
  triggerFly: (payload: FlyPayload) => Promise<void>;
  cancelFly: () => void;
  pulseCart: () => void;
};

const FlyToCartContext = createContext<FlyToCartContextValue | null>(null);

const FLY_MS = 520;
const FLY_SAFETY_MS = FLY_MS + 400;
const EMPTY_RECT: LayoutRect = { x: 0, y: 0, width: 0, height: 0 };

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const { haptic, sound } = useFeedback();
  const cartMeasureRef = useRef<MeasureTarget | null>(null);
  const flyingRef = useRef(false);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartPulse = useSharedValue(1);
  const cartSparkle = useSharedValue(0);
  const badgeBump = useSharedValue(1);
  const flightProgress = useSharedValue(0);
  const flyFrom = useSharedValue<LayoutRect>(EMPTY_RECT);
  const flyTo = useSharedValue<LayoutRect>(EMPTY_RECT);

  const [flyingImageUrl, setFlyingImageUrl] = useState<string | null>(null);
  const [isFlying, setIsFlying] = useState(false);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const registerCartTarget = useCallback((measure: MeasureTarget) => {
    cartMeasureRef.current = measure;
  }, []);

  const pulseCart = useCallback(() => {
    haptic('light');
    sound('pop');
    cartPulse.value = withSequence(
      withSpring(1.22, { damping: 10, stiffness: 380 }),
      withSpring(1, { damping: 14, stiffness: 280 }),
    );
    cartSparkle.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(0, { duration: 280 }),
    );
    badgeBump.value = withSequence(
      withSpring(1.35, { damping: 12, stiffness: 400 }),
      withSpring(1, { damping: 16, stiffness: 300 }),
    );
  }, [badgeBump, cartPulse, cartSparkle, haptic, sound]);

  const resetFlightVisuals = useCallback(() => {
    clearSafetyTimer();
    flyingRef.current = false;
    setIsFlying(false);
    setFlyingImageUrl(null);
    cancelAnimation(flightProgress);
    flightProgress.value = 0;
    flyFrom.value = EMPTY_RECT;
    flyTo.value = EMPTY_RECT;
  }, [clearSafetyTimer, flightProgress, flyFrom, flyTo]);

  const finishFlight = useCallback(
    (shouldPulse: boolean) => {
      if (!flyingRef.current) {
        return;
      }
      resetFlightVisuals();
      if (shouldPulse) {
        pulseCart();
      }
    },
    [pulseCart, resetFlightVisuals],
  );

  const cancelFly = useCallback(() => {
    if (!flyingRef.current) {
      return;
    }
    resetFlightVisuals();
  }, [resetFlightVisuals]);

  useEffect(() => {
    return () => {
      clearSafetyTimer();
    };
  }, [clearSafetyTimer]);

  const triggerFly = useCallback(
    async (payload: FlyPayload) => {
      if (flyingRef.current) {
        return;
      }

      flyingRef.current = true;
      setIsFlying(true);
      setFlyingImageUrl(payload.imageUrl);
      flyFrom.value = payload.from;
      flightProgress.value = 0;

      haptic('medium');
      sound('paper');

      let target: LayoutRect;
      try {
        target =
          (await cartMeasureRef.current?.()) ??
          ({
            x: payload.from.x + 120,
            y: payload.from.y - 40,
            width: 28,
            height: 28,
          } as LayoutRect);
      } catch {
        resetFlightVisuals();
        return;
      }

      // User may have navigated away while we were measuring.
      if (!flyingRef.current) {
        return;
      }

      flyTo.value = target;
      sound('swoosh');

      clearSafetyTimer();
      safetyTimerRef.current = setTimeout(() => {
        finishFlight(true);
      }, FLY_SAFETY_MS);

      flightProgress.value = withTiming(
        1,
        { duration: FLY_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          // Always clear — interrupted animations were leaving the flyer stuck.
          runOnJS(finishFlight)(Boolean(finished));
        },
      );
    },
    [
      clearSafetyTimer,
      finishFlight,
      flightProgress,
      flyFrom,
      flyTo,
      haptic,
      resetFlightVisuals,
      sound,
    ],
  );

  const value = useMemo<FlyToCartContextValue>(
    () => ({
      cartPulse,
      cartSparkle,
      badgeBump,
      flightProgress,
      flyFrom,
      flyTo,
      flyingImageUrl,
      isFlying,
      registerCartTarget,
      triggerFly,
      cancelFly,
      pulseCart,
    }),
    [
      badgeBump,
      cancelFly,
      cartPulse,
      cartSparkle,
      flightProgress,
      flyFrom,
      flyTo,
      flyingImageUrl,
      isFlying,
      pulseCart,
      registerCartTarget,
      triggerFly,
    ],
  );

  return <FlyToCartContext.Provider value={value}>{children}</FlyToCartContext.Provider>;
}

export function useFlyToCart() {
  const context = useContext(FlyToCartContext);
  if (!context) {
    throw new Error('useFlyToCart must be used within FlyToCartProvider.');
  }
  return context;
}

export function measureView(ref: RefObject<ViewType | null>) {
  return new Promise<LayoutRect | null>((resolve) => {
    const node = ref.current;
    if (!node) {
      resolve(null);
      return;
    }

    node.measureInWindow((x: number, y: number, width: number, height: number) => {
      if (width <= 0 || height <= 0) {
        resolve(null);
        return;
      }
      resolve({ x, y, width, height });
    });
  });
}
