export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
};

export type ShopifyProductVariant = {
  id: string;
  title: string;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  quantityAvailable: number | null;
  availableForSale: boolean;
};

export type ShopifyProduct = {
  id: string;
  title: string;
  description: string;
  handle: string;
  tags: string[];
  images: ShopifyImage[];
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  inventoryQuantity: number;
  variants: ShopifyProductVariant[];
};

export type ShopifyCollection = {
  id: string;
  title: string;
  description: string;
  handle: string;
  image: ShopifyImage | null;
  productIds: string[];
};

export type ShopifyPageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type ShopifyGraphQLError = {
  message: string;
};

export type ShopifyGraphQLResponse<T> = {
  data?: T;
  errors?: ShopifyGraphQLError[];
};

export type ShopifyProductNode = {
  id: string;
  title: string;
  description: string;
  handle: string;
  tags: string[];
  images: {
    edges: Array<{ node: ShopifyImage }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        quantityAvailable: number | null;
        price: ShopifyMoney;
        compareAtPrice: ShopifyMoney | null;
      };
    }>;
  };
};

export type ShopifyCollectionNode = {
  id: string;
  title: string;
  description: string;
  handle: string;
  image: ShopifyImage | null;
  products: {
    pageInfo: ShopifyPageInfo;
    edges: Array<{ node: { id: string } }>;
  };
};
