import { shopifyFetch } from './client';
import type { ShopifyProduct } from './types';

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          featuredImage {
            url
            altText
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                price {
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
    edges: Array<{
      node: {
        id: string;
        title: string;
        description: string;
        handle: string;
        featuredImage?: { url: string; altText?: string | null } | null;
        variants: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              availableForSale: boolean;
              price: { amount: string; currencyCode: string };
            };
          }>;
        };
      };
    }>;
  };
};

/**
 * Fetch products from the Shopify Storefront API.
 * Returns an empty array until credentials are configured.
 */
export async function getProducts(first = 20): Promise<ShopifyProduct[]> {
  try {
    const data = await shopifyFetch<ProductsQueryResult>(PRODUCTS_QUERY, { first });

    return data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      description: node.description,
      handle: node.handle,
      featuredImage: node.featuredImage,
      variants: node.variants.edges.map(({ node: variant }) => ({
        id: variant.id,
        title: variant.title,
        availableForSale: variant.availableForSale,
        price: variant.price,
      })),
    }));
  } catch {
    return [];
  }
}
