import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import type { CollectionFilters } from './CollectionFilterSheet';
import { getFilterSummary } from './CollectionFilterSheet';

type CollectionFilterBarProps = {
  filters: CollectionFilters;
  activeCount: number;
  onPress: () => void;
};

export default function CollectionFilterBar({
  filters,
  activeCount,
  onPress,
}: CollectionFilterBarProps) {
  const hasActiveFilters = activeCount > 0;

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 rounded-2xl border bg-white px-4 py-3.5"
      style={{
        borderColor: hasActiveFilters ? colors.brand : colors.border,
        backgroundColor: hasActiveFilters ? colors.cardActive : colors.background,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: hasActiveFilters ? '#E8F0E2' : '#F3F4F6' }}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={hasActiveFilters ? colors.brand : colors.textMuted}
            />
          </View>

          <View className="min-w-0 flex-1">
            <Text className="text-base font-semibold text-gray-900">Filter collections</Text>
            <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={1}>
              {getFilterSummary(filters)}
            </Text>
          </View>
        </View>

        <View className="ml-3 flex-row items-center gap-2">
          {hasActiveFilters ? (
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: colors.brand }}
            >
              <Text className="text-xs font-semibold text-white">{activeCount}</Text>
            </View>
          ) : null}
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}
