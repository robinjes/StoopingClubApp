import { useEffect, useState } from 'react';
import { Text, type TextProps } from 'react-native';

type CountUpNumberProps = {
  target: number;
  animationKey: number;
  delay?: number;
  duration?: number;
  suffix?: string;
  className?: string;
  style?: TextProps['style'];
};

export default function CountUpNumber({
  target,
  animationKey,
  delay = 0,
  duration = 1400,
  suffix = '',
  className,
  style,
}: CountUpNumberProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(0);

    const delayTimeout = setTimeout(() => {
      const startTime = Date.now();

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        setValue(Math.round(target * eased));

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    }, delay);

    return () => clearTimeout(delayTimeout);
  }, [animationKey, delay, duration, target]);

  const showSuffix = suffix && value >= target;
  const display = `${value.toLocaleString()}${showSuffix ? suffix : ''}`;

  return (
    <Text className={className} style={style}>
      {display}
    </Text>
  );
}
