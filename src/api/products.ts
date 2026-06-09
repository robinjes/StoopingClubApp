import type { ShopifyProduct, ShopifyProductNode } from '../types/shopify';
import { storefrontFetch } from './shopify';

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
          handle
          tags
          images(first: 20) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 50) {
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
    handle: node.handle,
    tags: node.tags,
    images: node.images.edges.map(({ node: image }) => image),
    price: firstVariant?.price ?? { amount: '0', currencyCode: 'USD' },
    compareAtPrice: firstVariant?.compareAtPrice ?? null,
    inventoryQuantity,
    variants,
  };
}

export async function getProducts(): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const data: ProductsQueryResult = await storefrontFetch<ProductsQueryResult>(
      PRODUCTS_QUERY,
      {
        first: 50,
        after,
      },
    );

    const edges = data.products.edges;
    const pageInfo = data.products.pageInfo;
    products.push(...edges.map(({ node }) => mapProductNode(node)));

    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo.endCursor;
  }

  return products;
}
