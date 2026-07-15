import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import {
  GRID_SORT_LABELS,
  type GridFilters,
  type GridSortOption,
  getGridFilterCount,
  hasActiveGridFilters,
} from '../../utils/shopFilters';

type GridSortFilterBarProps = {
  itemCount: number;
  sort: GridSortOption;
  filters: GridFilters;
  onSortPress: () => void;
  onFilterPress: () => void;
  onClearFilters: () => void;
};

export default function GridSortFilterBar({
  itemCount,
  sort,
  filters,
  onSortPress,
  onFilterPress,
  onClearFilters,
}: GridSortFilterBarProps) {
  const { colors } = useTheme();
  const filterCount = getGridFilterCount(filters);
  const showClear = hasActiveGridFilters(filters);

  return (
    <View className="px-4 pb-3 pt-1">
      <Text className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
        {itemCount} item{itemCount === 1 ? '' : 's'}
      </Text>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onSortPress}
          className="min-w-0 flex-1 flex-row items-center justify-between rounded-xl border px-3 py-2.5"
          style={{ borderColor: colors.border, backgroundColor: colors.background }}
          accessibilityRole="button"
          accessibilityLabel={`Sort: ${GRID_SORT_LABELS[sort]}`}
        >
          <Text className="mr-2 flex-1 text-sm text-gray-800 dark:text-gray-200" numberOfLines={1}>
            {GRID_SORT_LABELS[sort]}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>

        <Pressable
          onPress={onFilterPress}
          className="flex-row items-center gap-1.5 rounded-xl border px-3 py-2.5"
          style={{
            borderColor: filterCount > 0 ? colors.brand : colors.border,
            backgroundColor: filterCount > 0 ? colors.cardActive : colors.background,
          }}
          accessibilityRole="button"
          accessibilityLabel="Filter products"
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={filterCount > 0 ? colors.brand : colors.textMuted}
          />
          <Text
            className="text-sm font-medium"
            style={{ color: filterCount > 0 ? colors.brand : colors.text }}
          >
            Filter
          </Text>
          {filterCount > 0 ? (
            <View
              className="min-w-[20px] items-center rounded-full px-1.5 py-0.5"
              style={{ backgroundColor: colors.brand }}
            >
              <Text className="text-xs font-semibold text-white">{filterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {showClear ? (
        <Pressable
          onPress={onClearFilters}
          className="mt-3 flex-row items-center justify-center gap-2 rounded-full py-3"
          style={{ backgroundColor: '#DC2626' }}
          accessibilityRole="button"
          accessibilityLabel="Clear all filters"
        >
          <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" />
          <Text className="text-sm font-semibold text-white">Clear all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
