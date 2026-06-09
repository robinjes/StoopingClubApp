import { useCallback, useEffect, useState } from 'react';

import { getProducts } from '../services/shopify';
import type { ShopifyProduct } from '../services/shopify';

export function useShopifyProducts() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProducts();
      setProducts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { products, loading, error, refresh };
}
