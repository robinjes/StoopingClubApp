import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import type { CollectionFilters } from './CollectionFilterSheet';
import { getFilterSummary } from './CollectionFilterSheet';

type CollectionFilterBarProps = {
  filters: CollectionFilters;
  activeCount: number;
  onPress: () => void;
  onClear: () => void;
};

export default function CollectionFilterBar({
  filters,
  activeCount,
  onPress,
  onClear,
}: CollectionFilterBarProps) {
  const { colors } = useTheme();
  const hasActiveFilters = activeCount > 0;

  return (
    <View className="mb-4">
      <Pressable
        onPress={onPress}
        className="rounded-2xl border bg-white dark:bg-gray-950 px-4 py-3.5"
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
              <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Filter collections
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
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

      {hasActiveFilters ? (
        <Pressable
          onPress={onClear}
          className="mt-2 flex-row items-center justify-center gap-1.5 self-end px-1 py-1"
          accessibilityRole="button"
          accessibilityLabel="Clear filters"
        >
          <Ionicons name="close-circle-outline" size={16} color={colors.brand} />
          <Text className="text-sm font-medium" style={{ color: colors.brand }}>
            Clear filters
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
