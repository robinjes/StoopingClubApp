import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';

import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import type { TabParamList } from '../../navigation/TabNavigator';
import { useProductStore } from '../../store/productStore';
import type { ThemeColors } from '../../theme/colors';
import { formatViewedAt } from '../../utils/formatViewedAt';
import { getTrackedRecentlyViewed, HOME_RECENTLY_VIEWED_LIMIT } from '../../store/recentlyViewedStore';

type RecentlyViewedSectionProps = {
  colors: ThemeColors;
};

type TabNavigation = BottomTabNavigationProp<TabParamList>;

export default function RecentlyViewedSection({ colors }: RecentlyViewedSectionProps) {
  const { width } = useWindowDimensions();
  const tabNavigation = useNavigation<TabNavigation>();
  const products = useProductStore((state) => state.products);
  const { recentlyViewed, hydrate } = useRecentlyViewed();

  useFocusEffect(
    useCallback(() => {
      void hydrate();
    }, [hydrate]),
  );

  const recentItems = getTrackedRecentlyViewed(recentlyViewed)
    .slice(0, HOME_RECENTLY_VIEWED_LIMIT)
    .map((entry) => {
      const product = products.find((item) => item.id === entry.productId);
      return product ? { entry, product } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (recentItems.length === 0) {
    return null;
  }

  const horizontalPadding = 32;
  const sectionPadding = 24;
  const gap = 10;
  const gridWidth = width - horizontalPadding - sectionPadding;
  const cardWidth = (gridWidth - gap * (HOME_RECENTLY_VIEWED_LIMIT - 1)) / HOME_RECENTLY_VIEWED_LIMIT;

  function openProduct(productId: string) {
    tabNavigation.navigate('ShopTab', {
      screen: 'ProductDetail',
      params: { productId },
    });
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
        Recently Viewed
      </Text>

      <View className="flex-row" style={{ gap }}>
        {recentItems.map(({ entry, product }) => {
          const imageUrl = product.images[0]?.url;

          return (
            <Pressable
              key={entry.productId}
              accessibilityRole="button"
              accessibilityLabel={`Open ${product.title}`}
              onPress={() => openProduct(product.id)}
              className="overflow-hidden rounded-xl border"
              style={{
                width: cardWidth,
                borderColor: colors.border,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <View
                className="items-center justify-center"
                style={{
                  height: cardWidth,
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
                  <Text className="text-[10px]" style={{ color: colors.textMuted }}>
                    No image
                  </Text>
                )}
              </View>

              <View className="px-1.5 py-2">
                <Text
                  className="text-[10px] font-medium leading-4"
                  style={{ color: colors.text }}
                  numberOfLines={2}
                >
                  {product.title}
                </Text>
                <Text
                  className="mt-1 text-[9px]"
                  style={{ color: colors.textMuted }}
                  numberOfLines={1}
                >
                  {formatViewedAt(entry.viewedAt) ?? 'Viewed earlier'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
