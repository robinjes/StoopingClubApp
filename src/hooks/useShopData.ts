import { useEffect } from 'react';

import { getCollections } from '../api/collections';
import { fetchProductsPage } from '../api/products';
import { isShopifyConfigured } from '../services/shopify';
import { useCollectionStore } from '../store/collectionStore';
import { useProductStore } from '../store/productStore';

const INITIAL_PRODUCTS_PAGE_SIZE = 48;
const PRODUCTS_PAGE_SIZE = 100;

let loadPromise: Promise<void> | null = null;

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
    appendProducts,
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
    const collectionsPromise = getCollections().then(
      (collections) => ({ status: 'success' as const, collections }),
      (error: unknown) => ({ status: 'error' as const, error }),
    );
    let productPage = await fetchProductsPage(INITIAL_PRODUCTS_PAGE_SIZE);
    const fetchedProducts = [...productPage.products];
    const renderProgressively = isInitialLoad;

    if (renderProgressively) {
      setProducts(productPage.products);
      setLoading(false);
      setLoadingMore(productPage.pageInfo.hasNextPage);
    }

    while (productPage.pageInfo.hasNextPage) {
      productPage = await fetchProductsPage(PRODUCTS_PAGE_SIZE, productPage.pageInfo.endCursor);
      fetchedProducts.push(...productPage.products);

      if (renderProgressively) {
        appendProducts(productPage.products);
      }
    }

    if (!renderProgressively) {
      setProducts(fetchedProducts);
    }

    const collectionsResult = await collectionsPromise;
    if (collectionsResult.status === 'error') {
      throw collectionsResult.error;
    }
    setCollections(collectionsResult.collections);
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

/** Sync the latest products and collections from Shopify. */
export function refreshShopData(): Promise<void> {
  return runLoad({ background: true });
}

export function useShopData(): void {
  useEffect(() => {
    void prefetchShopData();
  }, []);
}
