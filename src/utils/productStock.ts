import type { ShopifyProduct } from '../types/shopify';

export function isProductInStock(product: ShopifyProduct): boolean {
  if (product.inventoryQuantity > 0) {
    return true;
  }

  return product.variants.some(
    (variant) => variant.availableForSale && (variant.quantityAvailable ?? 0) > 0,
  );
}

export function filterInStockProducts(products: ShopifyProduct[]): ShopifyProduct[] {
  return products.filter(isProductInStock);
}
