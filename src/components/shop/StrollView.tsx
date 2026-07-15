import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import AddToCartButton from '../feedback/AddToCartButton';
import AnimatedPressable from '../feedback/AnimatedPressable';
import { useFeedback } from '../../context/FeedbackContext';
import { getCurrentPickupSite } from '../../data/pickupSeason';
import { useTheme } from '../../context/ThemeContext';
import type { ShopifyProduct } from '../../types/shopify';
import { formatPrice } from '../../utils/formatPrice';
import { getProductCondition } from '../../utils/productText';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const HOLD_MS = 900;
const GLIMPSE_BLUR = 26;
const SWIPE_OUT_MS = 200;
const SWIPE_IN_MS = 280;

type StrollPhase = 'glimpse' | 'stooping' | 'discovered';
/** 1 = next (content exits left), -1 = previous (content exits right) */
type WalkDirection = 1 | -1;

type StrollViewProps = {
  products: ShopifyProduct[];
  onProductPress?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct) => void | Promise<void>;
  addingProductId?: string | null;
  emptyMessage?: string;
};

function shuffleProducts(items: ShopifyProduct[]): ShopifyProduct[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function StoopyHint({ message }: { message: string }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.hintRow}>
      <Image
        source={require('../../../assets/stoopylogo.png')}
        style={styles.hintStoopy}
        resizeMode="contain"
      />
      <View
        style={[
          styles.hintBubble,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            shadowOpacity: isDark ? 0.3 : 0.12,
          },
        ]}
      >
        <Text style={[styles.hintText, { color: colors.text }]}>{message}</Text>
      </View>
    </View>
  );
}

function DiscoveredCard({
  product,
  onProductPress,
  onAddToCart,
  isAdding,
  imageHeight,
}: {
  product: ShopifyProduct;
  onProductPress?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct) => void | Promise<void>;
  isAdding: boolean;
  imageHeight: number;
}) {
  const { colors } = useTheme();
  const imageRef = useRef<View>(null);
  const imageUrl = product.images[0]?.url;
  const category = product.tags[0] ?? 'Shop';
  const pickupSite = getCurrentPickupSite();
  const condition = getProductCondition(product.description);
  const isSoldOut = product.inventoryQuantity <= 0;

  return (
    <AnimatedPressable
      haptic="selection"
      pressedScale={0.99}
      onPress={() => onProductPress?.(product)}
      style={[
        styles.discoveredCard,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      <View ref={imageRef} style={[styles.discoveredImageWrap, { height: imageHeight }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.discoveredImage} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Text className="text-sm text-gray-400">No image</Text>
          </View>
        )}
        <View style={[styles.categoryBadge, { backgroundColor: colors.brand }]}>
          <Text style={styles.categoryBadgeText}>{category.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.discoveredMeta}>
        <Text style={[styles.discoveredTitle, { color: colors.text }]} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.discoveredSub}>
          Pickup · {pickupSite.name}
          {condition ? `  ·  Condition: ${condition}` : ''}
        </Text>
        {product.estRetailValue != null && product.estRetailValue > 0 ? (
          <Text style={styles.discoveredRetail}>
            Est. retail{' '}
            {formatPrice({ amount: String(product.estRetailValue), currencyCode: 'USD' })}
          </Text>
        ) : null}

        <View style={styles.discoveredActions}>
          <Text style={[styles.discoveredPrice, { color: colors.brand }]}>
            {formatPrice(product.price)}
          </Text>
          {!isSoldOut && onAddToCart ? (
            <AddToCartButton
              product={product}
              onAdd={onAddToCart}
              isAdding={isAdding}
              sourceRef={imageRef}
              compact
              backgroundColor={colors.brand}
            />
          ) : (
            <Text style={styles.soldOut}>Sold out</Text>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function StrollView({
  products,
  onProductPress,
  onAddToCart,
  addingProductId = null,
  emptyMessage,
}: StrollViewProps) {
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { haptic, sound } = useFeedback();
  const strollProducts = useMemo(() => shuffleProducts(products), [products]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<StrollPhase>('glimpse');
  const holdingRef = useRef(false);
  const isSwipingRef = useRef(false);

  const progress = useSharedValue(0);
  const slideX = useSharedValue(0);

  const product = strollProducts[index] ?? null;
  const imageUrl = product?.images[0]?.url ?? null;
  // Keep the entire discovered card—including its price and actions—inside
  // the stage on smaller phones where the app chrome takes significant space.
  const discoveredImageHeight = Math.min(250, Math.max(155, screenHeight * 0.27));

  const resetToGlimpse = useCallback(() => {
    holdingRef.current = false;
    setPhase('glimpse');
    progress.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  useEffect(() => {
    resetToGlimpse();
  }, [index, resetToGlimpse]);

  useEffect(() => {
    if (index >= strollProducts.length && strollProducts.length > 0) {
      setIndex(0);
    }
  }, [index, strollProducts.length]);

  const finishSwipeIn = useCallback(() => {
    isSwipingRef.current = false;
  }, []);

  const enterFromDirection = useCallback(
    (direction: WalkDirection) => {
      setIndex((current) => {
        if (strollProducts.length === 0) {
          return current;
        }
        return (current + direction + strollProducts.length) % strollProducts.length;
      });
      slideX.value = direction === 1 ? screenWidth : -screenWidth;
      slideX.value = withTiming(
        0,
        { duration: SWIPE_IN_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(finishSwipeIn)();
          }
        },
      );
    },
    [finishSwipeIn, screenWidth, slideX, strollProducts.length],
  );

  const walkTo = useCallback(
    (direction: WalkDirection) => {
      if (isSwipingRef.current || strollProducts.length === 0) {
        return;
      }

      isSwipingRef.current = true;
      holdingRef.current = false;
      haptic('selection');
      sound('swoosh');

      const exitX = direction === 1 ? -screenWidth : screenWidth;
      slideX.value = withTiming(
        exitX,
        { duration: SWIPE_OUT_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(enterFromDirection)(direction);
          } else {
            runOnJS(finishSwipeIn)();
          }
        },
      );
    },
    [enterFromDirection, finishSwipeIn, haptic, screenWidth, slideX, sound, strollProducts.length],
  );

  const goNext = useCallback(() => {
    walkTo(1);
  }, [walkTo]);

  const goPrev = useCallback(() => {
    walkTo(-1);
  }, [walkTo]);

  const completeDiscover = useCallback(() => {
    holdingRef.current = false;
    setPhase('discovered');
    haptic('light');
    sound('pop');
  }, [haptic, sound]);

  function handlePressIn() {
    if (phase === 'discovered' || isSwipingRef.current) {
      return;
    }
    holdingRef.current = true;
    setPhase('stooping');
    progress.value = withTiming(
      1,
      { duration: HOLD_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(completeDiscover)();
        }
      },
    );
  }

  function handlePressOut() {
    if (phase === 'discovered') {
      return;
    }
    if (progress.value >= 0.97) {
      holdingRef.current = false;
      return;
    }
    holdingRef.current = false;
    setPhase('glimpse');
    progress.value = withTiming(0, { duration: 240, easing: Easing.out(Easing.cubic) });
  }

  const leftTap = Gesture.Tap()
    .maxDuration(220)
    .onEnd((_event, success) => {
      if (success) {
        runOnJS(goPrev)();
      }
    });

  const rightTap = Gesture.Tap()
    .maxDuration(220)
    .onEnd((_event, success) => {
      if (success) {
        runOnJS(goNext)();
      }
    });

  const flingNext = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(goNext)();
    });

  const flingPrev = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(goPrev)();
    });

  const navFling = Gesture.Simultaneous(flingNext, flingPrev);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.88, 1.05]) }],
    opacity: interpolate(progress.value, [0, 1], [0.92, 1]),
  }));

  const imageAnimatedProps = useAnimatedProps(() => ({
    blurRadius: interpolate(progress.value, [0, 1], [GLIMPSE_BLUR, 0]),
  }));

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  if (strollProducts.length === 0 || !product) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
          {emptyMessage ?? 'No items to stroll through yet.'}
        </Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={navFling}>
      <View style={[styles.root, { backgroundColor: colors.cream }]}>
        {phase !== 'discovered' ? (
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.brand }]}>Stroll ✨</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Random finds. Take a closer look.
            </Text>
          </View>
        ) : null}

        <View style={styles.stage}>
          <Animated.View style={[styles.slideFrame, slideStyle]}>
            {phase === 'discovered' ? (
              <DiscoveredCard
                product={product}
                onProductPress={onProductPress}
                onAddToCart={onAddToCart}
                isAdding={addingProductId === product.id}
                imageHeight={discoveredImageHeight}
              />
            ) : (
              <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
                <Animated.View style={[styles.glimpseWrap, imageStyle]}>
                  {imageUrl ? (
                    <AnimatedImage
                      source={{ uri: imageUrl }}
                      style={styles.glimpseImage}
                      resizeMode="cover"
                      animatedProps={imageAnimatedProps}
                    />
                  ) : (
                    <View style={styles.imageFallback}>
                      <Text className="text-sm text-gray-400">No image</Text>
                    </View>
                  )}
                </Animated.View>
              </Pressable>
            )}
          </Animated.View>

          {phase === 'glimpse' ? (
            <View style={styles.hintOverlay} pointerEvents="none">
              <StoopyHint message={'Take a closer look\nPress & hold'} />
            </View>
          ) : null}

          {phase === 'stooping' ? (
            <View style={styles.stoopingHint} pointerEvents="none">
              <Text style={[styles.stoopingText, { color: colors.text }]}>
                Keep holding… Almost there
              </Text>
              <Image
                source={require('../../../assets/stoopylogo.png')}
                style={styles.hintStoopySm}
                resizeMode="contain"
              />
            </View>
          ) : null}

          {phase !== 'discovered' ? (
            <>
              <GestureDetector gesture={leftTap}>
                <View style={styles.leftZone} />
              </GestureDetector>
              <GestureDetector gesture={rightTap}>
                <View style={styles.rightZone} />
              </GestureDetector>
            </>
          ) : null}
        </View>

        <View style={styles.walkBar}>
          <AnimatedPressable
            haptic={null}
            pressedScale={0.9}
            accessibilityRole="button"
            accessibilityLabel="Previous find"
            onPress={goPrev}
            style={[styles.walkArrow, { borderColor: colors.border, backgroundColor: colors.background }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.brand} />
          </AnimatedPressable>

          <View style={styles.walkCopy}>
            <Text style={[styles.walkTitle, { color: colors.brand }]}>Keep walking</Text>
            <Text style={[styles.walkSubtitle, { color: colors.textMuted }]}>
              Tap right for another find
            </Text>
          </View>

          <AnimatedPressable
            haptic={null}
            pressedScale={0.9}
            accessibilityRole="button"
            accessibilityLabel="Next find"
            onPress={goNext}
            style={[styles.walkArrow, { borderColor: colors.border, backgroundColor: colors.background }]}
          >
            <Ionicons name="chevron-forward" size={22} color={colors.brand} />
          </AnimatedPressable>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 2,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  slideFrame: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
  },
  walkArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkCopy: {
    flex: 1,
    alignItems: 'center',
  },
  walkTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  walkSubtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  glimpseWrap: {
    width: '94%',
    aspectRatio: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  glimpseImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintOverlay: {
    position: 'absolute',
    bottom: '16%',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintStoopy: {
    width: 52,
    height: 52,
  },
  hintStoopySm: {
    width: 40,
    height: 40,
    marginTop: 8,
  },
  hintBubble: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  stoopingHint: {
    position: 'absolute',
    bottom: '12%',
    alignItems: 'center',
  },
  stoopingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  leftZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '20%',
    zIndex: 4,
  },
  rightZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '20%',
    zIndex: 4,
  },
  discoveredCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 2,
  },
  discoveredImageWrap: {
    width: '100%',
    backgroundColor: '#E5E7EB',
  },
  discoveredImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  discoveredMeta: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  discoveredTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  discoveredSub: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
  },
  discoveredRetail: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },
  discoveredActions: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  discoveredPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  soldOut: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});
