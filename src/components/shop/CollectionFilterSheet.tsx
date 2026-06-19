import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCategoryDescription } from '../../data/categoryDescriptions';
import { getCategoryIcon } from '../../data/categoryIcons';
import { getPickupLocationById, PICKUP_LOCATIONS } from '../../data/pickupLocations';
import type { ShopifyCollection, ShopifyProduct } from '../../types/shopify';
import { useTheme } from '../../context/ThemeContext';
import {
  getCategoryById,
  getCategoryProductCount,
  getRecentCategory,
  getTopLevelCategories,
} from '../../utils/categoryFilters';
import { getLocationProductCount, filterProductsByLocations } from '../../utils/locationFilters';

export type CollectionFilters = {
  locationIds: string[];
  categoryIds: string[];
};

export const EMPTY_COLLECTION_FILTERS: CollectionFilters = {
  locationIds: [],
  categoryIds: [],
};

type CollectionFilterSheetProps = {
  visible: boolean;
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  recentProductIds: string[];
  filters: CollectionFilters;
  onClose: () => void;
  onApply: (filters: CollectionFilters) => void;
};

type FilterOption = {
  id: string | null;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
};

type FilterOptionRowProps = {
  option: FilterOption;
  selected: boolean;
  onPress: () => void;
};

function FilterOptionRow({ option, selected, onPress }: FilterOptionRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center rounded-2xl border px-3 py-3"
      style={{
        backgroundColor: selected ? colors.cardActive : colors.background,
        borderColor: selected ? colors.brand : colors.border,
      }}
    >
      <View
        className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: selected ? '#E8F0E2' : '#F3F4F6' }}
      >
        <Ionicons
          name={option.icon}
          size={20}
          color={selected ? colors.brand : colors.textMuted}
        />
      </View>

      <View className="min-w-0 flex-1 pr-3">
        <Text
          className="text-base"
          style={{
            color: colors.text,
            fontWeight: selected ? '600' : '500',
          }}
        >
          {option.label}
        </Text>
        <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400" numberOfLines={2}>
          {option.description}
        </Text>
      </View>

      <View
        className="h-6 w-6 items-center justify-center rounded-full border"
        style={{
          borderColor: selected ? colors.brand : '#D1D5DB',
          backgroundColor: selected ? colors.brand : 'transparent',
        }}
      >
        {selected ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}

function FilterSection({
  title,
  options,
  selectedIds,
  onToggle,
}: {
  title: string;
  options: FilterOption[];
  selectedIds: string[];
  onToggle: (id: string | null) => void;
}) {
  if (options.length === 0) {
    return null;
  }

  const isSelected = (id: string | null) => {
    if (id === null) {
      return selectedIds.length === 0;
    }

    return selectedIds.includes(id);
  };

  return (
    <View className="mb-5">
      <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </Text>
      {options.map((option) => (
        <FilterOptionRow
          key={option.id ?? 'all'}
          option={option}
          selected={isSelected(option.id)}
          onPress={() => onToggle(option.id)}
        />
      ))}
    </View>
  );
}

function formatFilterLabels(labels: string[], fallback: string): string {
  if (labels.length === 0) {
    return fallback;
  }

  if (labels.length <= 2) {
    return labels.join(', ');
  }

  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
}

export function getFilterSummary(filters: CollectionFilters): string {
  const locationLabel = formatFilterLabels(
    filters.locationIds
      .map((locationId) => getPickupLocationById(locationId)?.label)
      .filter((label): label is string => Boolean(label)),
    'All locations',
  );
  const categoryLabel = formatFilterLabels(
    filters.categoryIds
      .map((categoryId) => getCategoryById(categoryId)?.label)
      .filter((label): label is string => Boolean(label)),
    'All categories',
  );

  return `${locationLabel} · ${categoryLabel}`;
}

export default function CollectionFilterSheet({
  visible,
  products,
  collections,
  recentProductIds,
  filters,
  onClose,
  onApply,
}: CollectionFilterSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [pendingLocationIds, setPendingLocationIds] = useState(filters.locationIds);
  const [pendingCategoryIds, setPendingCategoryIds] = useState(filters.categoryIds);

  useEffect(() => {
    if (visible) {
      setPendingLocationIds(filters.locationIds);
      setPendingCategoryIds(filters.categoryIds);
    }
  }, [filters.categoryIds, filters.locationIds, visible]);

  const locationScopedProducts = useMemo(
    () => filterProductsByLocations(products, pendingLocationIds),
    [pendingLocationIds, products],
  );

  function togglePendingLocationId(locationId: string | null) {
    if (locationId === null) {
      setPendingLocationIds([]);
      return;
    }

    setPendingLocationIds((current) =>
      current.includes(locationId)
        ? current.filter((id) => id !== locationId)
        : [...current, locationId],
    );
  }

  function togglePendingCategoryId(categoryId: string | null) {
    if (categoryId === null) {
      setPendingCategoryIds([]);
      return;
    }

    setPendingCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  const locationOptions = useMemo<FilterOption[]>(() => {
    const allCount = products.length;
    const options: FilterOption[] = [
      {
        id: null,
        label: 'All locations',
        description: 'Show items from every pickup spot',
        icon: 'location-outline',
        count: allCount,
      },
    ];

    for (const location of PICKUP_LOCATIONS) {
      const count = getLocationProductCount(products, location.id);
      if (count > 0) {
        options.push({
          id: location.id,
          label: location.label,
          description: location.description,
          icon: location.id === 'berkeley' ? 'storefront-outline' : 'map-outline',
          count,
        });
      }
    }

    return options;
  }, [products]);

  const categoryOptions = useMemo<FilterOption[]>(() => {
    const options: FilterOption[] = [
      {
        id: null,
        label: 'All items',
        description: 'Browse everything in stock',
        icon: 'apps-outline',
        count: locationScopedProducts.length,
      },
    ];

    for (const category of getTopLevelCategories()) {
      const count = getCategoryProductCount(
        locationScopedProducts,
        category,
        collections,
        recentProductIds,
      );

      if (count > 0) {
        options.push({
          id: category.id,
          label: category.label,
          description: getCategoryDescription(category.id, category.label),
          icon: getCategoryIcon(category.id),
          count,
        });
      }
    }

    const recentCategory = getRecentCategory();
    const recentCount = getCategoryProductCount(
      locationScopedProducts,
      recentCategory,
      collections,
      recentProductIds,
    );

    if (recentCount > 0) {
      options.push({
        id: recentCategory.id,
        label: recentCategory.label,
        description: getCategoryDescription(recentCategory.id, recentCategory.label),
        icon: getCategoryIcon(recentCategory.id),
        count: recentCount,
      });
    }

    return options;
  }, [collections, locationScopedProducts, recentProductIds]);

  useEffect(() => {
    setPendingCategoryIds((current) => {
      const validCategoryIds = current.filter((categoryId) =>
        categoryOptions.some((option) => option.id === categoryId),
      );

      if (
        validCategoryIds.length === current.length &&
        validCategoryIds.every((id, index) => id === current[index])
      ) {
        return current;
      }

      return validCategoryIds;
    });
  }, [categoryOptions]);

  const handleApply = () => {
    onApply({
      locationIds: pendingLocationIds,
      categoryIds: pendingCategoryIds,
    });
    onClose();
  };

  const handleClear = () => {
    setPendingLocationIds([]);
    setPendingCategoryIds([]);
    onApply(EMPTY_COLLECTION_FILTERS);
    onClose();
  };

  const hasPendingFilters = pendingLocationIds.length > 0 || pendingCategoryIds.length > 0;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(17, 24, 39, 0.45)' }}>
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close filters" />

        <View
          className="rounded-t-3xl bg-white dark:bg-gray-950 px-5 pt-5"
          style={{
            maxHeight: height * 0.88,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <View className="mb-1 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text
                className="text-2xl text-gray-900 dark:text-gray-100"
                style={{ fontFamily: 'Georgia' }}
              >
                Filter collections
              </Text>
              <Text className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                Choose one or more pickup locations and categories to narrow what you see.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: '#F3F4F6' }}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {locationOptions.length > 1 ? (
              <FilterSection
                title="Pickup location"
                options={locationOptions}
                selectedIds={pendingLocationIds}
                onToggle={togglePendingLocationId}
              />
            ) : null}

            <FilterSection
              title="Category"
              options={categoryOptions}
              selectedIds={pendingCategoryIds}
              onToggle={togglePendingCategoryId}
            />
          </ScrollView>

          <View className="mt-2 flex-row gap-3">
            {hasPendingFilters ? (
              <Pressable
                onPress={handleClear}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-full border py-4"
                style={{ borderColor: colors.border }}
                accessibilityRole="button"
                accessibilityLabel="Clear filters"
              >
                <Ionicons name="close-circle-outline" size={18} color={colors.textMuted} />
                <Text className="text-base font-semibold" style={{ color: colors.textMuted }}>
                  Clear
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={handleApply}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-full py-4"
              style={{ backgroundColor: colors.brand }}
              accessibilityRole="button"
              accessibilityLabel="Apply filters"
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text className="text-base font-semibold text-white">Apply filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
