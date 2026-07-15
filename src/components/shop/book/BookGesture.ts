import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, type SharedValue } from 'react-native-reanimated';

type CreateBookPanGestureOptions = {
  pageWidth: number;
  itemCount: number;
  pageIndex: SharedValue<number>;
  progress: SharedValue<number>;
  isAnimating: SharedValue<boolean>;
  dragDirection: SharedValue<number>;
  onPreload: () => void;
  onBeginForward: () => void;
  onBeginBackward: () => void;
  onSettle: (direction: number, projected: number) => void;
  onCancel: () => void;
};

/**
 * Horizontal pan gesture that drives the page curl in real time.
 * Vertical movement is ignored via activeOffsetX / failOffsetY constraints.
 */
export function createBookPanGesture({
  pageWidth,
  itemCount,
  pageIndex,
  progress,
  isAnimating,
  dragDirection,
  onPreload,
  onBeginForward,
  onBeginBackward,
  onSettle,
  onCancel,
}: CreateBookPanGestureOptions) {
  return Gesture.Pan()
    .activeOffsetX([-14, 14])
    .failOffsetY([-18, 18])
    .onBegin(() => {
      if (isAnimating.value) {
        return;
      }
      dragDirection.value = 0;
      runOnJS(onPreload)();
    })
    .onUpdate((event) => {
      if (isAnimating.value) {
        return;
      }

      const drag = -event.translationX / pageWidth;

      if (drag > 0.015 && pageIndex.value < itemCount - 1) {
        if (dragDirection.value !== 1) {
          dragDirection.value = 1;
          runOnJS(onBeginForward)();
        }
        progress.value = Math.min(Math.max(drag, 0), 1);
        return;
      }

      if (drag < -0.015 && pageIndex.value > 0) {
        if (dragDirection.value !== -1) {
          dragDirection.value = -1;
          runOnJS(onBeginBackward)();
        }
        progress.value = Math.min(Math.max(1 + drag, 0), 1);
      }
    })
    .onEnd((event) => {
      if (isAnimating.value) {
        return;
      }

      const direction = dragDirection.value;
      if (direction === 0) {
        if (progress.value > 0.01) {
          runOnJS(onCancel)();
        }
        return;
      }

      const velocityBoost = (-event.velocityX / pageWidth) * 0.18;
      const projected = Math.min(Math.max(progress.value + velocityBoost, 0), 1);
      runOnJS(onSettle)(direction, projected);
    });
}
