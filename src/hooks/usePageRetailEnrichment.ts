import { useEffect, useRef } from 'react';

import { fetchEstRetailFromStorefrontPage } from '../api/products';
import { useProductStore } from '../store/productStore';
import { useRetailValueStore } from '../store/retailValueStore';
import type { ShopifyProduct } from '../types/shopify';

/** Enriches Est. retail for the current page of products (max ~24). */
export function usePageRetailEnrichment(products: ShopifyProduct[]) {
  const setProductEstRetailValue = useProductStore((state) => state.setProductEstRetailValue);
  const setRetailValue = useRetailValueStore((state) => state.setRetailValue);
  const byHandle = useRetailValueStore((state) => state.byHandle);
  const attemptedRef = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;

    async function enrich() {
      for (const product of products) {
        if (cancelled) {
          return;
        }

        if (product.estRetailValue != null || byHandle[product.handle] != null) {
          if (product.estRetailValue == null && byHandle[product.handle] != null) {
            setProductEstRetailValue(product.id, byHandle[product.handle]);
          }
          continue;
        }

        if (attemptedRef.current.has(product.handle)) {
          continue;
        }

        attemptedRef.current.add(product.handle);
        const amount = await fetchEstRetailFromStorefrontPage(product.handle);
        if (amount != null) {
          setRetailValue(product.handle, amount);
          setProductEstRetailValue(product.id, amount);
        }
      }
    }

    void enrich();

    return () => {
      cancelled = true;
    };
  }, [byHandle, products, setProductEstRetailValue, setRetailValue]);
}
