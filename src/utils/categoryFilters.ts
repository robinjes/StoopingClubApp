import { SHOP_CATEGORIES, type ShopCategoryDefinition } from '../data/shopCategories';
import type { ShopifyCollection, ShopifyProduct } from '../types/shopify';

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

function getCollectionProductIds(
  category: ShopCategoryDefinition,
  collections: ShopifyCollection[],
): Set<string> | null {
  if (!category.collectionHandles?.length) {
    return null;
  }

  const ids = new Set<string>();
  for (const handle of category.collectionHandles) {
    const collection = collections.find((item) => item.handle === handle);
    if (collection) {
      collection.productIds.forEach((id) => ids.add(id));
    }
  }

  return ids.size > 0 ? ids : null;
}

export function productMatchesCategory(
  product: ShopifyProduct,
  category: ShopCategoryDefinition,
  collections: ShopifyCollection[],
): boolean {
  if (category.special === 'uncategorized') {
    return product.tags.length === 0;
  }

  if (category.special === 'recent') {
    return false;
  }

  const collectionIds = getCollectionProductIds(category, collections);
  if (collectionIds?.has(product.id)) {
    return true;
  }

  if (category.tagMatches?.some((tag) => tagMatchesProduct(tag, product))) {
    return true;
  }

  return false;
}

export function filterProductsByCategory(
  products: ShopifyProduct[],
  category: ShopCategoryDefinition,
  collections: ShopifyCollection[],
  recentProductIds: string[] = [],
): ShopifyProduct[] {
  if (category.special === 'recent') {
    const recentIds = new Set(recentProductIds);
    return products.filter((product) => recentIds.has(product.id));
  }

  return products.filter((product) => productMatchesCategory(product, category, collections));
}

export function getCategoryProductCount(
  products: ShopifyProduct[],
  category: ShopCategoryDefinition,
  collections: ShopifyCollection[],
  recentProductIds: string[] = [],
): number {
  return filterProductsByCategory(products, category, collections, recentProductIds).length;
}

export function getCategoryById(categoryId: string | null): ShopCategoryDefinition | null {
  if (!categoryId) {
    return null;
  }

  return SHOP_CATEGORIES.find((category) => category.id === categoryId) ?? null;
}

export function getTopLevelCategories(): ShopCategoryDefinition[] {
  return SHOP_CATEGORIES.filter((category) => !category.parentId && category.special !== 'recent');
}

export function getChildCategories(parentId: string): ShopCategoryDefinition[] {
  return SHOP_CATEGORIES.filter((category) => category.parentId === parentId);
}

export function getRecentCategory(): ShopCategoryDefinition {
  return SHOP_CATEGORIES.find((category) => category.special === 'recent')!;
}
