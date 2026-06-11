import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useWishlist } from '../../hooks/useWishlist';
import type { ShopStackParamList } from '../../navigation/stacks/ShopStack';
import { useProductStore } from '../../store/productStore';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice } from '../../utils/formatPrice';
import { stripHtml } from '../../utils/productText';

type ProductDetailScreenProps = NativeStackScreenProps<ShopStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen({ route }: ProductDetailScreenProps) {
  const { colors } = useTheme();
  const { productId } = route.params;
  const { width } = useWindowDimensions();
  const product = useProductStore((state) =>
    state.products.find((item) => item.id === productId),
  );
  const { handleAddToCart, addingProductId } = useAddToCart();
  const { isWishlisted, toggle } = useWishlist();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) {
    return (
      <ScreenLayout showBack>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-gray-500 dark:text-gray-400">Product not found.</Text>
        </View>
      </ScreenLayout>
    );
  }

  const images = product.images.length > 0 ? product.images : [];
  const selectedImage = images[selectedImageIndex]?.url;
  const category = product.tags[0] ?? 'Shop';
  const isSoldOut = product.inventoryQuantity <= 0;
  const isAdding = addingProductId === product.id;
  const description = stripHtml(product.description);

  return (
    <ScreenLayout showBack>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.cream }}
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white dark:bg-gray-950 px-4 pb-3 pt-2">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Shop / {category} / {product.title}
          </Text>
        </View>

        <View className="bg-white dark:bg-gray-950 px-4 pb-6">
          <View
            className="items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800"
            style={{ height: width * 0.85 }}
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            ) : (
              <Text className="text-sm text-gray-400">No image</Text>
            )}
          </View>

          {images.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="mt-3 gap-2"
            >
              {images.map((image, index) => (
                <Pressable
                  key={image.url}
                  onPress={() => setSelectedImageIndex(index)}
                  className="overflow-hidden rounded-lg border-2"
                  style={{
                    borderColor: selectedImageIndex === index ? colors.brand : colors.border,
                  }}
                >
                  <Image
                    source={{ uri: image.url }}
                    style={{ width: 64, height: 64 }}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <View className="mt-3 bg-white dark:bg-gray-950 px-4 py-6">
          <View className="flex-row items-start justify-between gap-3">
            <Text
              className="flex-1 text-2xl text-brand"
              style={{ fontFamily: 'Georgia', color: colors.brand }}
            >
              {product.title}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'
              }
              className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800"
              onPress={() => void toggle(product.id)}
            >
              <Ionicons
                name={isWishlisted(product.id) ? 'heart' : 'heart-outline'}
                size={22}
                color={isWishlisted(product.id) ? '#DC2626' : colors.textMuted}
              />
            </Pressable>
          </View>

          <Text className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {formatPrice(product.price)}
          </Text>

          <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">Local pickup only</Text>

          <Text className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            Availability:{' '}
            <Text style={{ color: isSoldOut ? '#DC2626' : colors.brand, fontWeight: '600' }}>
              {isSoldOut ? 'Out of stock' : `${product.inventoryQuantity} in stock`}
            </Text>
          </Text>

          <Pressable
            className="mt-5 items-center rounded-full py-4"
            style={{
              backgroundColor: colors.brand,
              opacity: isSoldOut ? 0.5 : 1,
            }}
            disabled={isSoldOut || isAdding}
            onPress={() => void handleAddToCart(product)}
          >
            {isAdding ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-bold tracking-wide text-white">
                {isSoldOut ? 'SOLD OUT' : 'ADD TO CART'}
              </Text>
            )}
          </Pressable>

          <Text className="mt-5 text-sm text-gray-600 dark:text-gray-400">
            Category: <Text className="font-medium text-gray-800 dark:text-gray-200">{category}</Text>
          </Text>

          {description ? (
            <View className="mt-6 border-t border-gray-100 pt-5">
              <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">About this item</Text>
              <Text className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
