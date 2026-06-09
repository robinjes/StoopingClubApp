export type ShopifyImage = {
  url: string;
  altText?: string | null;
};

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
};

export type ShopifyProduct = {
  id: string;
  title: string;
  description: string;
  handle: string;
  featuredImage?: ShopifyImage | null;
  variants: ShopifyProductVariant[];
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  price: ShopifyMoney;
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  subtotal: ShopifyMoney;
};

export type ShopifyApiError = {
  message: string;
};
