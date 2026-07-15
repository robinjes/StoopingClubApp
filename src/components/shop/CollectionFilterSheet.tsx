import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

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
import { filterProductsByLocations, getLocationProductCount } from '../../utils/locationFilters';

export type CollectionFilters = {
  locationIds: string[];
  categoryIds: string[];
};

export const EMPTY_COLLECTION_FILTERS: CollectionFilters = {
  locationIds: [],
  categoryIds: [],
};

type CollectionFilterSheetProps = {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  recentProductIds: string[];
  filters: CollectionFilters;
  onChange: (filters: CollectionFilters) => void;
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
  products,
  collections,
  recentProductIds,
  filters,
  onChange,
}: CollectionFilterSheetProps) {
  const locationScopedProducts = useMemo(
    () => filterProductsByLocations(products, filters.locationIds),
    [filters.locationIds, products],
  );

  function toggleLocationId(locationId: string | null) {
    if (locationId === null) {
      onChange({ ...filters, locationIds: [] });
      return;
    }

    const nextLocationIds = filters.locationIds.includes(locationId)
      ? filters.locationIds.filter((id) => id !== locationId)
      : [...filters.locationIds, locationId];

    onChange({ ...filters, locationIds: nextLocationIds });
  }

  function toggleCategoryId(categoryId: string | null) {
    if (categoryId === null) {
      onChange({ ...filters, categoryIds: [] });
      return;
    }

    const nextCategoryIds = filters.categoryIds.includes(categoryId)
      ? filters.categoryIds.filter((id) => id !== categoryId)
      : [...filters.categoryIds, categoryId];

    onChange({ ...filters, categoryIds: nextCategoryIds });
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

  const hasActiveFilters = filters.locationIds.length > 0 || filters.categoryIds.length > 0;

  const handleClear = () => {
    onChange(EMPTY_COLLECTION_FILTERS);
  };

  return (
    <ScrollView
      className="flex-1 px-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
    >
      {locationOptions.length > 1 ? (
        <FilterSection
          title="Pickup location"
          options={locationOptions}
          selectedIds={filters.locationIds}
          onToggle={toggleLocationId}
        />
      ) : null}

      <FilterSection
        title="Category"
        options={categoryOptions}
        selectedIds={filters.categoryIds}
        onToggle={toggleCategoryId}
      />

      {hasActiveFilters ? (
        <Pressable
          onPress={handleClear}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-full py-4"
          style={{ backgroundColor: '#DC2626' }}
          accessibilityRole="button"
          accessibilityLabel="Clear filters"
        >
          <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" />
          <Text className="text-base font-semibold text-white">Clear filters</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
