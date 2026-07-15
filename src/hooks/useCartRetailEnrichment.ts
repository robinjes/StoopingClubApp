import { useEffect, useRef, useState } from 'react';

import { fetchEstRetailFromStorefrontPage } from '../api/products';
import { useCart } from '../context/CartContext';
import { useProductStore } from '../store/productStore';
import { useRetailValueStore } from '../store/retailValueStore';
import { moneyAmount } from '../utils/estRetailValue';

/**
 * Fills missing Est. retail values for cart lines by scraping the public product page
 * when Storefront metafields are not yet exposed.
 */
export function useCartRetailEnrichment(enabled: boolean) {
  const { cart } = useCart();
  const products = useProductStore((state) => state.products);
  const setProductEstRetailValue = useProductStore((state) => state.setProductEstRetailValue);
  const setRetailValue = useRetailValueStore((state) => state.setRetailValue);
  const byHandle = useRetailValueStore((state) => state.byHandle);
  const attemptedRef = useRef(new Set<string>());
  const [isEnriching, setIsEnriching] = useState(false);

  useEffect(() => {
    if (!enabled || !cart?.lines.length) {
      setIsEnriching(false);
      return;
    }

    let cancelled = false;

    async function enrich() {
      const linesToEnrich = cart!.lines.filter((line) => {
        const catalog = products.find(
          (product) =>
            product.title === line.title ||
            product.variants.some((variant) => variant.id === line.merchandiseId),
        );
        const handle = line.productHandle ?? catalog?.handle ?? null;
        const catalogVariant = catalog?.variants.find(
          (variant) => variant.id === line.merchandiseId,
        );
        const known =
          line.estRetailValue ??
          catalog?.estRetailValue ??
          (handle ? byHandle[handle] : undefined) ??
          (moneyAmount(catalogVariant?.compareAtPrice ?? catalog?.compareAtPrice) || undefined);

        return known == null && Boolean(handle) && !attemptedRef.current.has(handle!);
      });

      if (!linesToEnrich.length) {
        return;
      }

      setIsEnriching(true);
      try {
        for (const line of linesToEnrich) {
          if (cancelled) {
            return;
          }

          const catalog = products.find(
            (product) =>
              product.title === line.title ||
              product.variants.some((variant) => variant.id === line.merchandiseId),
          );
          const handle = line.productHandle ?? catalog?.handle;
          if (!handle) {
            continue;
          }

          attemptedRef.current.add(handle);
          const amount = await fetchEstRetailFromStorefrontPage(handle);
          if (amount != null) {
            setRetailValue(handle, amount);
            if (catalog) {
              setProductEstRetailValue(catalog.id, amount);
            }
          }
        }
      } finally {
        if (!cancelled) {
          setIsEnriching(false);
        }
      }
    }

    void enrich();

    return () => {
      cancelled = true;
    };
  }, [byHandle, cart, enabled, products, setProductEstRetailValue, setRetailValue]);

  return isEnriching;
}
