import type { ShopSortOption } from '../components/shop/ShopToolbar';
import type { ShopifyCollection, ShopifyProduct } from '../types/shopify';
import { filterProductsByCategories } from './categoryFilters';
import { matchesProductSearch, scoreProductMatch } from './fuzzySearch';
import { filterInStockProducts, isProductInStock } from './productStock';

export type GridSortOption =
  | 'recently-added'
  | 'title-asc'
  | 'title-desc'
  | 'earlier-listings';

export type GridAvailabilityFilter = 'in-stock' | 'out-of-stock';

export type GridFilters = {
  categoryIds: string[];
  availability: GridAvailabilityFilter[];
};

export const DEFAULT_GRID_FILTERS: GridFilters = {
  categoryIds: [],
  availability: ['in-stock'],
};

export const GRID_SORT_OPTIONS: GridSortOption[] = [
  'recently-added',
  'title-asc',
  'title-desc',
  'earlier-listings',
];

export const GRID_SORT_LABELS: Record<GridSortOption, string> = {
  'recently-added': 'Recently added',
  'title-asc': 'Alphabetically, A–Z',
  'title-desc': 'Alphabetically, Z–A',
  'earlier-listings': 'Earlier listings',
};

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

export function gridSortProducts(
  products: ShopifyProduct[],
  sort: GridSortOption,
): ShopifyProduct[] {
  const sorted = [...products];

  switch (sort) {
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'earlier-listings':
      return sorted.sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
    case 'recently-added':
    default:
      return sorted.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  }
}

function filterProductsByAvailability(
  products: ShopifyProduct[],
  availability: GridAvailabilityFilter[],
): ShopifyProduct[] {
  const showInStock = availability.includes('in-stock');
  const showOutOfStock = availability.includes('out-of-stock');

  if (showInStock && showOutOfStock) {
    return products;
  }

  if (showInStock) {
    return filterInStockProducts(products);
  }

  if (showOutOfStock) {
    return products.filter((product) => !isProductInStock(product));
  }

  return filterInStockProducts(products);
}

export function applyGridFilters(
  products: ShopifyProduct[],
  filters: GridFilters,
  collections: ShopifyCollection[],
  recentProductIds: string[],
): ShopifyProduct[] {
  let result = filterProductsByAvailability(products, filters.availability);

  if (filters.categoryIds.length > 0) {
    result = filterProductsByCategories(
      result,
      filters.categoryIds,
      collections,
      recentProductIds,
    );
  }

  return result;
}

export function hasActiveGridFilters(filters: GridFilters): boolean {
  return (
    filters.categoryIds.length > 0 ||
    filters.availability.length !== 1 ||
    filters.availability[0] !== 'in-stock'
  );
}

export function getGridFilterCount(filters: GridFilters): number {
  let count = filters.categoryIds.length;
  const isDefaultAvailability =
    filters.availability.length === 1 && filters.availability[0] === 'in-stock';

  if (!isDefaultAvailability) {
    count += filters.availability.length;
  }

  return count;
}

export function hasActiveSearch(query: string): boolean {
  return query.trim().length > 0;
}

export { matchesProductSearch };
