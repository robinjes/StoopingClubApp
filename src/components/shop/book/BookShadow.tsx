import {
  Group,
  LinearGradient,
  Rect,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { getFoldLineX } from './bookMath';
import type { BookFlipDirection } from './bookTypes';

type BookShadowProps = {
  width: number;
  height: number;
  progress: SharedValue<number>;
  direction: BookFlipDirection;
};

/**
 * Dynamic cast shadow and fold crease shading rendered beneath the turning page.
 */
export default function BookShadow({ width, height, progress, direction }: BookShadowProps) {
  const shadowX = useDerivedValue(() => {
    const fold = getFoldLineX(width, progress.value, direction);
    const spread = direction === 'forward' ? fold * 0.18 : (width - fold) * 0.18;
    return direction === 'forward' ? fold - 8 : fold - spread;
  });

  const shadowWidth = useDerivedValue(() => {
    const fold = getFoldLineX(width, progress.value, direction);
    const spread = direction === 'forward' ? fold * 0.18 : (width - fold) * 0.18;
    return Math.max(spread, 6);
  });

  const shadowOpacity = useDerivedValue(() => Math.min(progress.value * 0.55, 0.42));

  const creaseX = useDerivedValue(() => getFoldLineX(width, progress.value, direction) - 2);

  const creaseOpacity = useDerivedValue(
    () => Math.min(progress.value * 0.85, 0.7) * (1 - Math.abs(progress.value - 0.5) * 0.35),
  );

  return (
    <Group>
      <Rect x={shadowX} y={10} width={shadowWidth} height={height - 20} opacity={shadowOpacity} color="#000000" />
      <RoundedRect x={creaseX} y={0} width={4} height={height} r={2} opacity={creaseOpacity}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(4, 0)}
          colors={['rgba(0,0,0,0.45)', 'rgba(255,255,255,0.35)', 'rgba(0,0,0,0.2)']}
        />
      </RoundedRect>
    </Group>
  );
}
