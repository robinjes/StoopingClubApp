import type { ShopSortOption } from '../components/shop/ShopToolbar';
import type { ShopifyProduct } from '../types/shopify';
import { matchesProductSearch, scoreProductMatch } from './fuzzySearch';

export const NEW_ARRIVALS_LIMIT = 48;

export function getNewArrivalsProducts(products: ShopifyProduct[]): ShopifyProduct[] {
  return [...products]
    .sort((left, right) => {
      const rightTime = Date.parse(right.createdAt);
      const leftTime = Date.parse(left.createdAt);

      if (Number.isFinite(rightTime) && Number.isFinite(leftTime)) {
        return rightTime - leftTime;
      }

      return 0;
    })
    .slice(0, NEW_ARRIVALS_LIMIT);
}

export function searchProducts(products: ShopifyProduct[], query: string): ShopifyProduct[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return products;
  }

  return products
    .map((product) => ({
      product,
      score: scoreProductMatch(product, trimmed),
    }))
    .filter(({ score }) => score >= 0.42)
    .sort((left, right) => right.score - left.score)
    .map(({ product }) => product);
}

/** @deprecated Use searchProducts — kept for ShopCatalogView compatibility */
export function filterProductsBySearch(products: ShopifyProduct[], query: string): ShopifyProduct[] {
  return searchProducts(products, query);
}

export function sortProducts(products: ShopifyProduct[], sort: ShopSortOption): ShopifyProduct[] {
  const sorted = [...products];

  switch (sort) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'price-asc':
      return sorted.sort(
        (a, b) => Number.parseFloat(a.price.amount) - Number.parseFloat(b.price.amount),
      );
    case 'price-desc':
      return sorted.sort(
        (a, b) => Number.parseFloat(b.price.amount) - Number.parseFloat(a.price.amount),
      );
    case 'latest':
      return sorted.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
    default:
      return sorted;
  }
}

export function hasActiveSearch(query: string): boolean {
  return query.trim().length > 0;
}

export { matchesProductSearch };
