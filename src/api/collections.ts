import type { ShopifyCollection, ShopifyCollectionNode } from '../types/shopify';
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
          products(first: 250) {
            edges {
              node {
                id
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

function mapCollectionNode(node: ShopifyCollectionNode): ShopifyCollection {
  return {
    id: node.id,
    title: node.title,
    description: node.description,
    handle: node.handle,
    image: node.image,
    productIds: node.products.edges.map(({ node: product }) => product.id),
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
