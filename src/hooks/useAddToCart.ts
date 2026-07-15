import { useCallback, useState } from 'react';

import { fetchEstRetailFromStorefrontPage } from '../api/products';
import { useCart } from '../context/CartContext';
import { useProductStore } from '../store/productStore';
import { useRetailValueStore } from '../store/retailValueStore';
import type { ShopifyProduct } from '../types/shopify';

export function useAddToCart() {
  const { addItem } = useCart();
  const setProductEstRetailValue = useProductStore((state) => state.setProductEstRetailValue);
  const setRetailValue = useRetailValueStore((state) => state.setRetailValue);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const handleAddToCart = useCallback(
    async (product: ShopifyProduct) => {
      const variantId = product.variants[0]?.id;
      if (!variantId) {
        return;
      }

      setAddingProductId(product.id);
      try {
        if (product.estRetailValue == null) {
          const scraped = await fetchEstRetailFromStorefrontPage(product.handle);
          if (scraped != null) {
            setProductEstRetailValue(product.id, scraped);
            setRetailValue(product.handle, scraped);
          }
        }
        await addItem(variantId);
      } finally {
        setAddingProductId(null);
      }
    },
    [addItem, setProductEstRetailValue, setRetailValue],
  );

  return { handleAddToCart, addingProductId };
}
