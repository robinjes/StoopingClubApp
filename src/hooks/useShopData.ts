import { useEffect } from 'react';

import { getCollections } from '../api/collections';
import { fetchProductsPage } from '../api/products';
import { isShopifyConfigured } from '../services/shopify';
import { useCollectionStore } from '../store/collectionStore';
import { useProductStore } from '../store/productStore';

let loadPromise: Promise<void> | null = null;

async function fetchAllProducts(): Promise<Awaited<ReturnType<typeof fetchProductsPage>>['products']> {
  const products: Awaited<ReturnType<typeof fetchProductsPage>>['products'] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const page = await fetchProductsPage(50, after);
    products.push(...page.products);
    hasNextPage = page.pageInfo.hasNextPage;
    after = page.pageInfo.endCursor;
  }

  return products;
}

async function loadShopData(options: { background?: boolean } = {}): Promise<void> {
  if (!isShopifyConfigured()) {
    useProductStore.getState().setError(
      'Shopify is not configured. Check your .env credentials.',
    );
    return;
  }

  const { background = false } = options;
  const {
    products,
    setProducts,
    setLoading,
    setLoadingMore,
    setError,
  } = useProductStore.getState();
  const { setCollections } = useCollectionStore.getState();

  const isInitialLoad = products.length === 0;

  if (isInitialLoad && !background) {
    setLoading(true);
  }
  setError(null);

  try {
    const [fetchedProducts, fetchedCollections] = await Promise.all([
      fetchAllProducts(),
      getCollections(),
    ]);

    setProducts(fetchedProducts);
    setCollections(fetchedCollections);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load products.';
    if (!background || products.length === 0) {
      setError(message);
    }
    console.error('Failed to load shop data:', message);
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
}

function runLoad(options: { background?: boolean } = {}): Promise<void> {
  if (!loadPromise) {
    loadPromise = loadShopData(options).finally(() => {
      loadPromise = null;
    });
  }

  return loadPromise;
}

/** Load shop data on first app open (shows loader if empty). */
export function prefetchShopData(): Promise<void> {
  const hasProducts = useProductStore.getState().products.length > 0;
  return runLoad({ background: hasProducts });
}

/** Always sync latest products and collections from Shopify. */
export function refreshShopData(): Promise<void> {
  return runLoad({ background: true });
}

export function useShopData(): void {
  useEffect(() => {
    void prefetchShopData();
  }, []);
}
