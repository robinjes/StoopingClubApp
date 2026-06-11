import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { ShopifyCollection, ShopifyProduct } from '../../types/shopify';
import { useTheme } from '../../context/ThemeContext';
import {
  getCategoryProductCount,
  getChildCategories,
  getRecentCategory,
  getTopLevelCategories,
} from '../../utils/categoryFilters';

type CategoryListProps = {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  selectedId: string | null;
  recentProductIds: string[];
  onSelect: (categoryId: string | null) => void;
};

type CategoryRowProps = {
  label: string;
  count: number;
  selected: boolean;
  indented?: boolean;
  onPress: () => void;
};

function CategoryRow({ label, count, selected, indented = false, onPress }: CategoryRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-2.5"
      style={{ paddingLeft: indented ? 16 : 0 }}
    >
      <View className="flex-1 flex-row items-center gap-1.5">
        {indented ? (
          <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
        ) : null}
        <Text
          className="flex-1 text-sm"
          style={{
            color: selected ? colors.brand : colors.text,
            fontWeight: selected ? '600' : '400',
          }}
        >
          {label}
        </Text>
      </View>
      <Text className="text-sm text-gray-500 dark:text-gray-400">({count})</Text>
    </Pressable>
  );
}

function CategoryGroup({
  products,
  collections,
  selectedId,
  recentProductIds,
  onSelect,
}: CategoryListProps) {
  const topLevel = getTopLevelCategories();

  return (
    <View>
      {topLevel.map((category) => {
        const parentCount = getCategoryProductCount(
          products,
          category,
          collections,
          recentProductIds,
        );

        const visibleChildren = getChildCategories(category.id)
          .map((child) => ({
            child,
            count: getCategoryProductCount(products, child, collections, recentProductIds),
          }))
          .filter(({ count }) => count > 0);

        const showParent = parentCount > 0 || visibleChildren.length > 0;
        if (!showParent) {
          return null;
        }

        return (
          <View key={category.id}>
            {parentCount > 0 ? (
              <CategoryRow
                label={category.label}
                count={parentCount}
                selected={selectedId === category.id}
                onPress={() => onSelect(category.id)}
              />
            ) : null}
            {visibleChildren.map(({ child, count }) => (
              <CategoryRow
                key={child.id}
                label={child.label}
                count={count}
                selected={selectedId === child.id}
                indented
                onPress={() => onSelect(child.id)}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

export default function CategoryList({
  products,
  collections,
  selectedId,
  recentProductIds,
  onSelect,
}: CategoryListProps) {
  const { colors } = useTheme();
  const recentCategory = getRecentCategory();
  const recentCount = getCategoryProductCount(
    products,
    recentCategory,
    collections,
    recentProductIds,
  );

  return (
    <View>
      <Text
        className="mb-3 text-base text-gray-900 dark:text-gray-100"
        style={{ fontFamily: 'Georgia' }}
      >
        Categories
      </Text>

      <Pressable onPress={() => onSelect(null)} className="mb-1">
        <Text
          className="text-sm"
          style={{
            color: selectedId === null ? colors.brand : colors.textMuted,
            fontWeight: selectedId === null ? '600' : '400',
          }}
        >
          All items
        </Text>
      </Pressable>

      <CategoryGroup
        products={products}
        collections={collections}
        selectedId={selectedId}
        recentProductIds={recentProductIds}
        onSelect={onSelect}
      />

      {recentCount > 0 ? (
        <View className="mt-3 border-t border-gray-100 pt-3">
          <CategoryRow
            label={recentCategory.label}
            count={recentCount}
            selected={selectedId === recentCategory.id}
            onPress={() => onSelect(recentCategory.id)}
          />
        </View>
      ) : null}
    </View>
  );
}
