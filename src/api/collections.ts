import type {
  ShopifyCollection,
  ShopifyCollectionNode,
  ShopifyProductNode,
} from '../types/shopify';
import type { ShopifyProduct } from '../types/shopify';
import { storefrontFetch } from './shopify';

const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
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
          image {
            url
            altText
          }
          products(first: 50) {
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
      }
    }
  }
`;

type CollectionsQueryResult = {
  collections: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    edges: Array<{ node: ShopifyCollectionNode }>;
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

function mapCollectionNode(node: ShopifyCollectionNode): ShopifyCollection {
  return {
    id: node.id,
    title: node.title,
    description: node.description,
    handle: node.handle,
    image: node.image,
    products: node.products.edges.map(({ node: product }) => mapProductNode(product)),
  };
}

export async function getCollections(): Promise<ShopifyCollection[]> {
  const collections: ShopifyCollection[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const data: CollectionsQueryResult = await storefrontFetch<CollectionsQueryResult>(
      COLLECTIONS_QUERY,
      {
        first: 50,
        after,
      },
    );

    const edges = data.collections.edges;
    const pageInfo = data.collections.pageInfo;
    collections.push(...edges.map(({ node }) => mapCollectionNode(node)));

    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo.endCursor;
  }

  return collections;
}
