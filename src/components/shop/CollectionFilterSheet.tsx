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
import { getLocationProductCount } from '../../utils/locationFilters';

export type CollectionFilters = {
  locationId: string | null;
  categoryId: string | null;
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
  selectedId,
  onSelect,
}: {
  title: string;
  options: FilterOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <View className="mb-5">
      <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </Text>
      {options.map((option) => (
        <FilterOptionRow
          key={option.id ?? 'all'}
          option={option}
          selected={selectedId === option.id}
          onPress={() => onSelect(option.id)}
        />
      ))}
    </View>
  );
}

export function getFilterSummary(filters: CollectionFilters): string {
  const locationLabel = getPickupLocationById(filters.locationId)?.label ?? 'All locations';
  const categoryLabel = getCategoryById(filters.categoryId)?.label ?? 'All categories';

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
  const [pendingLocationId, setPendingLocationId] = useState(filters.locationId);
  const [pendingCategoryId, setPendingCategoryId] = useState(filters.categoryId);

  useEffect(() => {
    if (visible) {
      setPendingLocationId(filters.locationId);
      setPendingCategoryId(filters.categoryId);
    }
  }, [filters.categoryId, filters.locationId, visible]);

  const locationScopedProducts = useMemo(() => {
    if (!pendingLocationId) {
      return products;
    }

    const location = PICKUP_LOCATIONS.find((item) => item.id === pendingLocationId);
    if (!location) {
      return products;
    }

    return products.filter((product) =>
      location.tagMatches.some((tag) =>
        product.tags.some(
          (productTag) =>
            productTag.toLowerCase() === tag.toLowerCase() ||
            productTag.toLowerCase().includes(tag.toLowerCase()),
        ),
      ),
    );
  }, [pendingLocationId, products]);

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
    if (!pendingCategoryId) {
      return;
    }

    const stillVisible = categoryOptions.some((option) => option.id === pendingCategoryId);
    if (!stillVisible) {
      setPendingCategoryId(null);
    }
  }, [categoryOptions, pendingCategoryId]);

  const handleApply = () => {
    onApply({
      locationId: pendingLocationId,
      categoryId: pendingCategoryId,
    });
    onClose();
  };

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
                Choose a pickup location and category to narrow what you see.
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
                selectedId={pendingLocationId}
                onSelect={setPendingLocationId}
              />
            ) : null}

            <FilterSection
              title="Category"
              options={categoryOptions}
              selectedId={pendingCategoryId}
              onSelect={setPendingCategoryId}
            />
          </ScrollView>

          <Pressable
            onPress={handleApply}
            className="mt-2 flex-row items-center justify-center gap-2 rounded-full py-4"
            style={{ backgroundColor: colors.brand }}
          >
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            <Text className="text-base font-semibold text-white">Apply filters</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
