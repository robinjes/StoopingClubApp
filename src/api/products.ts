import type { ShopifyProduct, ShopifyProductNode } from '../types/shopify';
import {
  moneyAmount,
  parseEstRetailAmount,
  parseMetafieldMoney,
} from '../utils/estRetailValue';
import { storefrontFetch } from './shopify';

const EST_RETAIL_METAFIELD_IDS = `
  { namespace: "custom", key: "typical_retail_value_estimate" }
  { namespace: "custom", key: "est_retail_value" }
  { namespace: "custom", key: "estimated_retail_value" }
  { namespace: "custom", key: "retail_value" }
  { namespace: "custom", key: "est_retail" }
`;

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          description
          descriptionHtml
          handle
          tags
          createdAt
          metafields(identifiers: [${EST_RETAIL_METAFIELD_IDS}]) {
            namespace
            key
            value
            type
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                quantityAvailable
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

type ProductsQueryResult = {
  products: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    edges: Array<{ node: ShopifyProductNode }>;
  };
};

export type ProductsPage = {
  products: ShopifyProduct[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

function resolveEstRetailValue(node: ShopifyProductNode): number | null {
  const metafields = node.metafields?.filter(Boolean) ?? [];
  for (const field of metafields) {
    if (!field) {
      continue;
    }
    const money = parseMetafieldMoney(field.value);
    if (money) {
      return moneyAmount(money);
    }
  }

  const fromDescription = parseEstRetailAmount(node.descriptionHtml, node.description);
  if (fromDescription != null) {
    return fromDescription;
  }

  const compareAt = node.variants.edges[0]?.node.compareAtPrice;
  const compareAmount = moneyAmount(compareAt);
  return compareAmount > 0 ? compareAmount : null;
}

function mapProductNode(node: ShopifyProductNode): ShopifyProduct {
  const variants = node.variants.edges.map(({ node: variant }) => ({
    id: variant.id,
    title: variant.title,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    quantityAvailable: variant.quantityAvailable,
    availableForSale: variant.availableForSale,
  }));

  const firstVariant = variants[0];
  const inventoryQuantity = variants.reduce(
    (total, variant) => total + (variant.quantityAvailable ?? 0),
    0,
  );

  return {
    id: node.id,
    title: node.title,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    handle: node.handle,
    tags: node.tags,
    createdAt: node.createdAt,
    images: node.images.edges.map(({ node: image }) => image),
    price: firstVariant?.price ?? { amount: '0', currencyCode: 'USD' },
    compareAtPrice: firstVariant?.compareAtPrice ?? null,
    estRetailValue: resolveEstRetailValue(node),
    inventoryQuantity,
    variants,
  };
}

export async function fetchProductsPage(
  first = 50,
  after: string | null = null,
): Promise<ProductsPage> {
  const data: ProductsQueryResult = await storefrontFetch<ProductsQueryResult>(PRODUCTS_QUERY, {
    first,
    after,
  });

  return {
    products: data.products.edges.map(({ node }) => mapProductNode(node)),
    pageInfo: data.products.pageInfo,
  };
}

export async function getProducts(): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const page = await fetchProductsPage(50, after);
    products.push(...page.products);
    hasNextPage = page.pageInfo.hasNextPage;
    after = page.pageInfo.endCursor;
  }

  return products;
}

/** Fetches Est. retail value from the live product page when metafields are unavailable. */
export async function fetchEstRetailFromStorefrontPage(handle: string): Promise<number | null> {
  const candidates = [
    `https://berkeleystooping.org/products/${handle}`,
    `https://stooping-club-berkeley.myshopify.com/products/${handle}`,
  ];

  const domain = process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (domain) {
    candidates.push(`https://${domain}/products/${handle}`);
  }

  for (const url of candidates) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }
      const html = await response.text();
      const amount = parseEstRetailAmount(html);
      if (amount != null) {
        return amount;
      }
    } catch {
      // Try next candidate.
    }
  }

  return null;
}
