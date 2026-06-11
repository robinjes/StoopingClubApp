import { Text, View } from 'react-native';

import type { ImpactStat } from '../../data/homeContent';
import type { ThemeColors } from '../../theme/colors';
import CountUpNumber from './CountUpNumber';

type ImpactStatsGridProps = {
  stats: ImpactStat[];
  colors: ThemeColors;
  animationKey: number;
};

export default function ImpactStatsGrid({ stats, colors, animationKey }: ImpactStatsGridProps) {
  return (
    <View
      className="rounded-3xl border px-4 py-8"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <Text
        className="mb-8 text-center text-2xl"
        style={{ fontFamily: 'Georgia', color: colors.brand }}
      >
        Our Impact at a Glance
      </Text>

      <View className="flex-row flex-wrap">
        {stats.map((stat, index) => (
          <View key={stat.id} className="w-1/2 items-center px-3 py-4">
            <CountUpNumber
              target={stat.target}
              prefix={stat.prefix}
              suffix={stat.suffix}
              animationKey={animationKey}
              delay={320 + index * 100}
              className="text-3xl font-bold"
              style={{ color: colors.brand }}
            />
            <Text className="mt-2 text-center text-sm leading-5" style={{ color: colors.text }}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
