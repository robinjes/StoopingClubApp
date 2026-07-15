import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, type View } from 'react-native';
import type { RefObject } from 'react';

import { useFeedback } from '../../context/FeedbackContext';
import { measureView, useFlyToCart } from '../../context/FlyToCartContext';
import type { ShopifyProduct } from '../../types/shopify';
import AnimatedPressable from './AnimatedPressable';

type AddToCartButtonProps = {
  product: ShopifyProduct;
  onAdd: (product: ShopifyProduct) => void | Promise<void>;
  isAdding?: boolean;
  sourceRef: RefObject<View | null>;
  label?: string;
  compact?: boolean;
  fullWidth?: boolean;
  /** When true (default for compact cards), show a cart icon instead of text. */
  iconOnly?: boolean;
  backgroundColor: string;
};

export default function AddToCartButton({
  product,
  onAdd,
  isAdding = false,
  sourceRef,
  label = 'Add to cart',
  compact = false,
  fullWidth = false,
  iconOnly,
  backgroundColor,
}: AddToCartButtonProps) {
  const { triggerFly } = useFlyToCart();
  const { haptic, sound } = useFeedback();
  const showIconOnly = iconOnly ?? compact;

  async function handlePress() {
    if (isAdding) {
      return;
    }

    const from = await measureView(sourceRef);
    if (from) {
      void triggerFly({
        imageUrl: product.images[0]?.url ?? null,
        from,
      });
    } else {
      haptic('medium');
      sound('paper');
    }

    try {
      await onAdd(product);
    } catch {
      haptic('error');
    }
  }

  return (
    <AnimatedPressable
      haptic={null}
      pressedScale={0.95}
      disabled={isAdding}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={
        fullWidth
          ? 'w-full items-center rounded-full py-4'
          : showIconOnly
            ? 'h-9 w-9 items-center justify-center rounded-full'
            : compact
              ? 'rounded-full px-3 py-1.5'
              : 'rounded-full px-4 py-2'
      }
      style={{ backgroundColor }}
      onPress={() => void handlePress()}
    >
      {isAdding ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : showIconOnly ? (
        <Ionicons name="cart" size={18} color="#FFFFFF" />
      ) : (
        <Text
          className={`font-semibold text-white ${
            fullWidth ? 'text-sm font-bold tracking-wide' : compact ? 'text-xs' : 'text-sm'
          }`}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}
