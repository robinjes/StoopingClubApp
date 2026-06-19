import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';

import { FEATURED_CATEGORIES } from '../../data/featuredCategories';
import { getCategoryIcon } from '../../data/categoryIcons';
import { useCollectionStore } from '../../store/collectionStore';
import { useShopNavigationStore } from '../../store/shopNavigationStore';
import type { ThemeColors } from '../../theme/colors';
import type { TabParamList } from '../../navigation/TabNavigator';

const COLUMNS = 4;

type FeaturedCategoriesGridProps = {
  colors: ThemeColors;
};

type TabNavigation = BottomTabNavigationProp<TabParamList>;

function chunkRows<T>(items: T[], columns: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += columns) {
    rows.push(items.slice(index, index + columns));
  }
  return rows;
}

export default function FeaturedCategoriesGrid({ colors }: FeaturedCategoriesGridProps) {
  const { width } = useWindowDimensions();
  const tabNavigation = useNavigation<TabNavigation>();
  const collections = useCollectionStore((state) => state.collections);
  const requestCategory = useShopNavigationStore((state) => state.requestCategory);

  const homePadding = 32;
  const sectionPadding = 24;
  const gap = 8;
  const gridWidth = width - homePadding - sectionPadding;
  const cardWidth = (gridWidth - gap * (COLUMNS - 1)) / COLUMNS;
  const imageHeight = cardWidth * 0.9;

  const categoryRows = chunkRows(FEATURED_CATEGORIES, COLUMNS);

  function openCategory(categoryId: string) {
    requestCategory(categoryId);
    tabNavigation.navigate('ShopTab');
  }

  function openShop() {
    tabNavigation.navigate('ShopTab');
  }

  return (
    <View
      className="rounded-3xl border px-3 py-5"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <Text
        className="mb-4 text-center text-lg"
        style={{ fontFamily: 'Georgia', color: colors.text }}
      >
        Featured Categories
      </Text>

      <View style={{ gap }}>
        {categoryRows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} className="flex-row" style={{ gap }}>
            {row.map((category) => {
              const collection = collections.find(
                (item) => item.handle === category.collectionHandle,
              );
              const imageUrl = collection?.image?.url;

              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${category.label}`}
                  onPress={() => openCategory(category.categoryId)}
                  className="overflow-hidden rounded-lg border"
                  style={{
                    width: cardWidth,
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceMuted,
                  }}
                >
                  <View
                    className="items-center justify-center"
                    style={{
                      height: imageHeight,
                      backgroundColor: colors.cream,
                    }}
                  >
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        resizeMode="cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Ionicons
                        name={getCategoryIcon(category.categoryId)}
                        size={cardWidth > 70 ? 22 : 18}
                        color={colors.brand}
                      />
                    )}
                  </View>

                  <View
                    className="items-center justify-center px-0.5 py-1.5"
                    style={{
                      minHeight: 30,
                      backgroundColor: colors.surfaceMuted,
                    }}
                  >
                    <Text
                      className="text-center font-medium"
                      style={{ fontSize: cardWidth > 70 ? 9 : 8, color: colors.text }}
                      numberOfLines={2}
                    >
                      {category.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Shop all products"
        className="mt-4 items-center self-center rounded-full px-6 py-2.5"
        style={{ backgroundColor: colors.brand }}
        onPress={openShop}
      >
        <Text className="text-xs font-semibold text-white">Shop all products</Text>
      </Pressable>
    </View>
  );
}
