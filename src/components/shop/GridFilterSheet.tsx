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
import type { ShopifyCollection, ShopifyProduct } from '../../types/shopify';
import { useTheme } from '../../context/ThemeContext';
import {
  getCategoryById,
  getCategoryProductCount,
  getRecentCategory,
  getTopLevelCategories,
} from '../../utils/categoryFilters';
import { filterInStockProducts, isProductInStock } from '../../utils/productStock';
import {
  DEFAULT_GRID_FILTERS,
  applyGridFilters,
  type GridAvailabilityFilter,
  type GridFilters,
} from '../../utils/shopFilters';

type GridFilterSheetProps = {
  visible: boolean;
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  recentProductIds: string[];
  filters: GridFilters;
  onClose: () => void;
  onApply: (filters: GridFilters) => void;
};

type FilterOption = {
  id: string | null;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function FilterOptionRow({
  option,
  selected,
  onPress,
}: {
  option: FilterOption;
  selected: boolean;
  onPress: () => void;
}) {
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
        {option.description ? (
          <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400" numberOfLines={2}>
            {option.description}
          </Text>
        ) : null}
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
  isSelected,
  onToggle,
}: {
  title: string;
  options: FilterOption[];
  isSelected: (id: string | null) => boolean;
  onToggle: (id: string | null) => void;
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
          selected={isSelected(option.id)}
          onPress={() => onToggle(option.id)}
        />
      ))}
    </View>
  );
}

function countAvailability(products: ShopifyProduct[], availability: GridAvailabilityFilter): number {
  if (availability === 'in-stock') {
    return filterInStockProducts(products).length;
  }

  return products.filter((product) => !isProductInStock(product)).length;
}

export default function GridFilterSheet({
  visible,
  products,
  collections,
  recentProductIds,
  filters,
  onClose,
  onApply,
}: GridFilterSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [pendingCategoryIds, setPendingCategoryIds] = useState(filters.categoryIds);
  const [pendingAvailability, setPendingAvailability] = useState(filters.availability);

  useEffect(() => {
    if (visible) {
      setPendingCategoryIds(filters.categoryIds);
      setPendingAvailability(filters.availability);
    }
  }, [filters, visible]);

  const availabilityScopedProducts = useMemo(() => {
    const showInStock = pendingAvailability.includes('in-stock');
    const showOutOfStock = pendingAvailability.includes('out-of-stock');

    if (showInStock && showOutOfStock) {
      return products;
    }

    if (showInStock) {
      return filterInStockProducts(products);
    }

    if (showOutOfStock) {
      return products.filter((product) => !isProductInStock(product));
    }

    return filterInStockProducts(products);
  }, [pendingAvailability, products]);

  const categoryOptions = useMemo<FilterOption[]>(() => {
    const options: FilterOption[] = [
      {
        id: null,
        label: 'All items',
        description: 'Browse everything that matches availability',
        icon: 'apps-outline',
      },
    ];

    for (const category of getTopLevelCategories()) {
      const count = getCategoryProductCount(
        availabilityScopedProducts,
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
        });
      }
    }

    const recentCategory = getRecentCategory();
    const recentCount = getCategoryProductCount(
      availabilityScopedProducts,
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
      });
    }

    return options;
  }, [availabilityScopedProducts, collections, recentProductIds]);

  useEffect(() => {
    setPendingCategoryIds((current) =>
      current.filter((categoryId) => categoryOptions.some((option) => option.id === categoryId)),
    );
  }, [categoryOptions]);

  function toggleCategoryId(categoryId: string | null) {
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

  function toggleAvailability(availability: GridAvailabilityFilter) {
    setPendingAvailability((current) =>
      current.includes(availability)
        ? current.filter((item) => item !== availability)
        : [...current, availability],
    );
  }

  const handleApply = () => {
    const nextAvailability =
      pendingAvailability.length > 0 ? pendingAvailability : DEFAULT_GRID_FILTERS.availability;

    onApply({
      categoryIds: pendingCategoryIds,
      availability: nextAvailability,
    });
    onClose();
  };

  const handleClear = () => {
    onApply(DEFAULT_GRID_FILTERS);
    onClose();
  };

  const hasPendingFilters =
    pendingCategoryIds.length > 0 ||
    pendingAvailability.length !== 1 ||
    pendingAvailability[0] !== 'in-stock';

  const pendingResultCount = useMemo(() => {
    const nextAvailability =
      pendingAvailability.length > 0 ? pendingAvailability : DEFAULT_GRID_FILTERS.availability;

    return applyGridFilters(
      products,
      {
        categoryIds: pendingCategoryIds,
        availability: nextAvailability,
      },
      collections,
      recentProductIds,
    ).length;
  }, [collections, pendingAvailability, pendingCategoryIds, products, recentProductIds]);

  const availabilityOptions: FilterOption[] = [
    {
      id: 'in-stock',
      label: 'In stock',
      description: `${countAvailability(products, 'in-stock')} items available now`,
      icon: 'checkmark-circle-outline',
    },
    {
      id: 'out-of-stock',
      label: 'Out of stock',
      description: `${countAvailability(products, 'out-of-stock')} items currently unavailable`,
      icon: 'close-circle-outline',
    },
  ];

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
                Filter
              </Text>
              <Text className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                Narrow by category and availability.
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
            <FilterSection
              title="Categories"
              options={categoryOptions}
              isSelected={(id) => (id === null ? pendingCategoryIds.length === 0 : pendingCategoryIds.includes(id))}
              onToggle={toggleCategoryId}
            />

            <FilterSection
              title="Availability"
              options={availabilityOptions}
              isSelected={(id) =>
                id === null ? pendingAvailability.length === 0 : pendingAvailability.includes(id as GridAvailabilityFilter)
              }
              onToggle={(id) => {
                if (id === 'in-stock' || id === 'out-of-stock') {
                  toggleAvailability(id);
                }
              }}
            />
          </ScrollView>

          <View className="mt-2 flex-row gap-3">
            {hasPendingFilters ? (
              <Pressable
                onPress={handleClear}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-full py-4"
                style={{ backgroundColor: '#DC2626' }}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
              >
                <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" />
                <Text className="text-base font-semibold text-white">Clear all</Text>
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
              <Text className="text-base font-semibold text-white">
                See {pendingResultCount} items
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function getGridCategoryLabels(categoryIds: string[]): string {
  if (categoryIds.length === 0) {
    return 'All categories';
  }

  return categoryIds
    .map((categoryId) => getCategoryById(categoryId)?.label)
    .filter((label): label is string => Boolean(label))
    .join(', ');
}
