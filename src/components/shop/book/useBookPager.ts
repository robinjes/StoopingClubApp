import { useCallback, useRef, useState } from 'react';
import type { SkImage } from '@shopify/react-native-skia';
import {
  Easing,
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import {
  FLIP_COMMIT_THRESHOLD,
  FLIP_DURATION_MS,
  FLIP_MIN_DURATION_MS,
} from './bookConstants';
import type { BookFlipDirection, BookFlipSession } from './bookTypes';
import { haptics } from '../../../services/feedback/haptics';
import { playSound } from '../../../services/feedback/sounds';

const FLIP_EASING = Easing.out(Easing.cubic);
const SPRING_BACK = { damping: 24, stiffness: 260, mass: 0.9 };

function onPageTurnSettled() {
  haptics.light();
  playSound('pageRustle');
}

type CapturePageSnapshot = () => Promise<SkImage | null>;

type UseBookPagerOptions = {
  itemCount: number;
  getImageUrl: (index: number) => string | null;
  capturePageSnapshot?: CapturePageSnapshot;
};

type UseBookPagerResult = {
  index: number;
  progress: SharedValue<number>;
  isAnimating: SharedValue<boolean>;
  dragDirection: SharedValue<number>;
  flipSession: BookFlipSession | null;
  isInteracting: boolean;
  preloadSnapshot: () => void;
  beginForwardSession: () => void;
  beginBackwardSession: () => void;
  settleFlip: (direction: number, projected: number) => void;
  cancelFlip: () => void;
  tapForward: () => void;
  tapBackward: () => void;
};

export function useBookPager({
  itemCount,
  getImageUrl,
  capturePageSnapshot,
}: UseBookPagerOptions): UseBookPagerResult {
  const [index, setIndex] = useState(0);
  const [flipSession, setFlipSession] = useState<BookFlipSession | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const indexRef = useRef(0);
  const sessionActiveRef = useRef(false);
  const queuedTapRef = useRef<BookFlipDirection | null>(null);
  const cachedSnapshotRef = useRef<SkImage | null>(null);
  const captureRef = useRef(capturePageSnapshot);

  captureRef.current = capturePageSnapshot;

  const progress = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  const dragDirection = useSharedValue(0);

  const syncIndex = useCallback((nextIndex: number) => {
    indexRef.current = nextIndex;
    setIndex(nextIndex);
    cachedSnapshotRef.current = null;
  }, []);

  const releaseLayers = useCallback(() => {
    sessionActiveRef.current = false;
    setIsInteracting(false);
    setFlipSession(null);
  }, []);

  const mountSession = useCallback((session: BookFlipSession) => {
    sessionActiveRef.current = true;
    setIsInteracting(true);
    setFlipSession(session);
  }, []);

  const readSnapshot = useCallback(async (): Promise<SkImage | null> => {
    if (cachedSnapshotRef.current) {
      return cachedSnapshotRef.current;
    }

    const captured = (await captureRef.current?.()) ?? null;
    cachedSnapshotRef.current = captured;
    return captured;
  }, []);

  const preloadSnapshot = useCallback(() => {
    void readSnapshot();
  }, [readSnapshot]);

  const createForwardSession = useCallback(
    (turningPageSnapshot: SkImage | null): BookFlipSession | null => {
      const turningIndex = indexRef.current;
      const revealIndex = turningIndex + 1;
      if (revealIndex >= itemCount) {
        return null;
      }

      return {
        direction: 'forward',
        turningIndex,
        revealIndex,
        turningImageUrl: getImageUrl(turningIndex),
        revealImageUrl: getImageUrl(revealIndex),
        turningPageSnapshot,
        revealPageSnapshot: null,
      };
    },
    [getImageUrl, itemCount],
  );

  const createBackwardSession = useCallback(
    (revealPageSnapshot: SkImage | null): BookFlipSession | null => {
      const turningIndex = indexRef.current - 1;
      const revealIndex = indexRef.current;
      if (turningIndex < 0) {
        return null;
      }

      return {
        direction: 'backward',
        turningIndex,
        revealIndex,
        turningImageUrl: getImageUrl(turningIndex),
        revealImageUrl: getImageUrl(revealIndex),
        turningPageSnapshot: null,
        revealPageSnapshot,
      };
    },
    [getImageUrl],
  );

  const runQueuedFlip = useCallback(
    (startForward: () => void, startBackward: () => void) => {
      const queued = queuedTapRef.current;
      queuedTapRef.current = null;
      if (queued === 'forward' && indexRef.current < itemCount - 1) {
        startForward();
      } else if (queued === 'backward' && indexRef.current > 0) {
        startBackward();
      }
    },
    [itemCount],
  );

  const finishFlip = useCallback(
    (nextIndex: number, startForward: () => void, startBackward: () => void) => {
      isAnimating.value = false;
      dragDirection.value = 0;
      progress.value = 0;
      sessionActiveRef.current = false;
      syncIndex(nextIndex);
      onPageTurnSettled();

      requestAnimationFrame(() => {
        releaseLayers();
        runQueuedFlip(startForward, startBackward);
      });
    },
    [dragDirection, isAnimating, progress, releaseLayers, runQueuedFlip, syncIndex],
  );

  const startForwardSession = useCallback(async () => {
    if (sessionActiveRef.current) {
      return;
    }

    const turningPageSnapshot = await readSnapshot();
    const session = createForwardSession(turningPageSnapshot);
    if (session) {
      haptics.selection();
      mountSession(session);
    }
  }, [createForwardSession, mountSession, readSnapshot]);

  const startBackwardSession = useCallback(async () => {
    if (sessionActiveRef.current) {
      return;
    }

    const revealPageSnapshot = await readSnapshot();
    const session = createBackwardSession(revealPageSnapshot);
    if (session) {
      haptics.selection();
      mountSession(session);
      progress.value = 1;
    }
  }, [createBackwardSession, mountSession, progress, readSnapshot]);

  const startForwardSessionAndAnimate = useCallback(
    async (fromProgress: number) => {
      if (sessionActiveRef.current) {
        return;
      }

      const turningPageSnapshot = await readSnapshot();
      const session = createForwardSession(turningPageSnapshot);
      if (!session) {
        return;
      }

      mountSession(session);
      const nextIndex = indexRef.current + 1;
      const duration = Math.max(FLIP_MIN_DURATION_MS, FLIP_DURATION_MS * (1 - fromProgress));
      isAnimating.value = true;
      progress.value = fromProgress;
      progress.value = withTiming(1, { duration, easing: FLIP_EASING }, (done) => {
        if (done) {
          runOnJS(finishFlip)(nextIndex, () => void startForwardSessionAndAnimate(0), () => void startBackwardSessionAndAnimate(1));
        }
      });
    },
    [createForwardSession, finishFlip, isAnimating, mountSession, progress, readSnapshot],
  );

  const startBackwardSessionAndAnimate = useCallback(
    async (fromProgress: number) => {
      if (sessionActiveRef.current) {
        return;
      }

      const revealPageSnapshot = await readSnapshot();
      const session = createBackwardSession(revealPageSnapshot);
      if (!session) {
        return;
      }

      mountSession(session);
      const prevIndex = indexRef.current - 1;
      const duration = Math.max(FLIP_MIN_DURATION_MS, FLIP_DURATION_MS * fromProgress);
      isAnimating.value = true;
      progress.value = fromProgress === 0 ? 1 : fromProgress;
      progress.value = withTiming(0, { duration, easing: FLIP_EASING }, (done) => {
        if (done) {
          runOnJS(finishFlip)(prevIndex, () => void startForwardSessionAndAnimate(0), () => void startBackwardSessionAndAnimate(1));
        }
      });
    },
    [createBackwardSession, finishFlip, isAnimating, mountSession, progress, readSnapshot],
  );

  const animateForwardToEnd = useCallback(
    (fromProgress: number) => {
      if (!sessionActiveRef.current) {
        void startForwardSessionAndAnimate(fromProgress);
        return;
      }

      const nextIndex = indexRef.current + 1;
      const duration = Math.max(FLIP_MIN_DURATION_MS, FLIP_DURATION_MS * (1 - fromProgress));
      isAnimating.value = true;
      progress.value = fromProgress;
      progress.value = withTiming(1, { duration, easing: FLIP_EASING }, (done) => {
        if (done) {
          runOnJS(finishFlip)(nextIndex, () => void startForwardSessionAndAnimate(0), () => void startBackwardSessionAndAnimate(1));
        }
      });
    },
    [finishFlip, isAnimating, progress, startForwardSessionAndAnimate],
  );

  const animateBackwardToEnd = useCallback(
    (fromProgress: number) => {
      if (!sessionActiveRef.current) {
        void startBackwardSessionAndAnimate(fromProgress);
        return;
      }

      const prevIndex = indexRef.current - 1;
      const duration = Math.max(FLIP_MIN_DURATION_MS, FLIP_DURATION_MS * fromProgress);
      isAnimating.value = true;
      progress.value = fromProgress;
      progress.value = withTiming(0, { duration, easing: FLIP_EASING }, (done) => {
        if (done) {
          runOnJS(finishFlip)(prevIndex, () => void startForwardSessionAndAnimate(0), () => void startBackwardSessionAndAnimate(1));
        }
      });
    },
    [finishFlip, isAnimating, progress, startBackwardSessionAndAnimate],
  );

  const beginForwardSession = useCallback(() => {
    void startForwardSession();
  }, [startForwardSession]);

  const beginBackwardSession = useCallback(() => {
    void startBackwardSession();
  }, [startBackwardSession]);

  const cancelFlip = useCallback(() => {
    isAnimating.value = false;
    dragDirection.value = 0;
    progress.value = withSpring(0, SPRING_BACK, (done) => {
      if (done) {
        runOnJS(releaseLayers)();
      }
    });
  }, [dragDirection, isAnimating, progress, releaseLayers]);

  const settleFlip = useCallback(
    (direction: number, projected: number) => {
      const shouldComplete = projected > FLIP_COMMIT_THRESHOLD;

      if (direction === 1) {
        if (shouldComplete && indexRef.current < itemCount - 1) {
          animateForwardToEnd(progress.value);
          return;
        }
        cancelFlip();
        return;
      }

      if (direction === -1) {
        if (!shouldComplete && indexRef.current > 0) {
          animateBackwardToEnd(progress.value);
          return;
        }

        isAnimating.value = false;
        dragDirection.value = 0;
        progress.value = withSpring(1, SPRING_BACK, (done) => {
          if (done) {
            progress.value = 0;
            runOnJS(releaseLayers)();
          }
        });
      }
    },
    [animateBackwardToEnd, animateForwardToEnd, cancelFlip, dragDirection, isAnimating, itemCount, progress, releaseLayers],
  );

  const tapForward = useCallback(() => {
    if (indexRef.current >= itemCount - 1) {
      return;
    }

    if (isAnimating.value) {
      queuedTapRef.current = 'forward';
      return;
    }

    void startForwardSessionAndAnimate(0);
  }, [isAnimating, itemCount, startForwardSessionAndAnimate]);

  const tapBackward = useCallback(() => {
    if (indexRef.current <= 0) {
      return;
    }

    if (isAnimating.value) {
      queuedTapRef.current = 'backward';
      return;
    }

    void startBackwardSessionAndAnimate(1);
  }, [isAnimating, startBackwardSessionAndAnimate]);

  return {
    index,
    progress,
    isAnimating,
    dragDirection,
    flipSession,
    isInteracting,
    preloadSnapshot,
    beginForwardSession,
    beginBackwardSession,
    settleFlip,
    cancelFlip,
    tapForward,
    tapBackward,
  };
}
