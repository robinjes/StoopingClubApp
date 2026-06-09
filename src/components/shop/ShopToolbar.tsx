import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export type ShopSortOption = 'latest' | 'title' | 'price-asc' | 'price-desc';

const SORT_LABELS: Record<ShopSortOption, string> = {
  latest: 'Sort by latest',
  title: 'Sort by name',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
};

const SORT_ORDER: ShopSortOption[] = ['latest', 'title', 'price-asc', 'price-desc'];

type ShopToolbarProps = {
  totalCount: number;
  visibleCount: number;
  sort: ShopSortOption;
  onSortChange: (sort: ShopSortOption) => void;
  onStrollPress?: () => void;
};

export default function ShopToolbar({
  totalCount,
  visibleCount,
  sort,
  onSortChange,
  onStrollPress,
}: ShopToolbarProps) {
  const start = totalCount === 0 ? 0 : 1;
  const end = visibleCount;

  function cycleSort() {
    const currentIndex = SORT_ORDER.indexOf(sort);
    const nextIndex = (currentIndex + 1) % SORT_ORDER.length;
    onSortChange(SORT_ORDER[nextIndex]);
  }

  return (
    <View className="border-b border-gray-100 bg-white px-4 py-4">
      <Text className="text-xs text-gray-500">Home / Shop</Text>

      <View className="mt-3 flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm text-gray-600">
          Showing {start}–{end} of {totalCount} results
        </Text>

        <View className="flex-row items-center gap-2">
          {onStrollPress ? (
            <Pressable
              onPress={onStrollPress}
              className="rounded-lg border border-gray-200 px-3 py-2"
            >
              <Ionicons name="shuffle-outline" size={16} color={colors.brand} />
            </Pressable>
          ) : null}

          <Pressable
            onPress={cycleSort}
            className="max-w-[160px] flex-row items-center gap-1 rounded-lg border border-gray-200 px-3 py-2"
          >
            <Text className="flex-1 text-xs text-gray-700" numberOfLines={1}>
              {SORT_LABELS[sort]}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
