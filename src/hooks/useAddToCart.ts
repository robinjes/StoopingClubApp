import { useCallback, useState } from 'react';

import { useCart } from '../context/CartContext';
import type { ShopifyProduct } from '../types/shopify';

export function useAddToCart() {
  const { addItem } = useCart();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const handleAddToCart = useCallback(
    async (product: ShopifyProduct) => {
      const variantId = product.variants[0]?.id;
      if (!variantId) {
        return;
      }

      setAddingProductId(product.id);
      try {
        await addItem(variantId);
      } finally {
        setAddingProductId(null);
      }
    },
    [addItem],
  );

  return { handleAddToCart, addingProductId };
}
