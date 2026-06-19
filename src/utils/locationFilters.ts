import { getPickupLocationById } from '../data/pickupLocations';
import type { ShopifyProduct } from '../types/shopify';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tagMatchesProduct(tagMatch: string, product: ShopifyProduct): boolean {
  const needle = normalize(tagMatch);
  return product.tags.some((tag) => {
    const haystack = normalize(tag);
    return haystack === needle || haystack.includes(needle);
  });
}

export function productMatchesLocation(
  product: ShopifyProduct,
  locationId: string | null,
): boolean {
  if (!locationId) {
    return true;
  }

  const location = getPickupLocationById(locationId);
  if (!location) {
    return true;
  }

  return location.tagMatches.some((tag) => tagMatchesProduct(tag, product));
}

export function filterProductsByLocation(
  products: ShopifyProduct[],
  locationId: string | null,
): ShopifyProduct[] {
  return products.filter((product) => productMatchesLocation(product, locationId));
}

export function filterProductsByLocations(
  products: ShopifyProduct[],
  locationIds: string[],
): ShopifyProduct[] {
  if (locationIds.length === 0) {
    return products;
  }

  return products.filter((product) =>
    locationIds.some((locationId) => productMatchesLocation(product, locationId)),
  );
}

export function getLocationProductCount(
  products: ShopifyProduct[],
  locationId: string | null,
): number {
  return filterProductsByLocation(products, locationId).length;
}
