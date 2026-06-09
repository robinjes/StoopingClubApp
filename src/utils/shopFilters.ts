import type { ShopSortOption } from '../components/shop/ShopToolbar';
import type { ShopifyProduct } from '../types/shopify';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function filterProductsBySearch(
  products: ShopifyProduct[],
  query: string,
): ShopifyProduct[] {
  const needle = normalize(query);
  if (!needle) {
    return products;
  }

  return products.filter((product) => {
    const haystack = [product.title, product.description, ...product.tags].join(' ').toLowerCase();
    return haystack.includes(needle);
  });
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
    default:
      return sorted;
  }
}
