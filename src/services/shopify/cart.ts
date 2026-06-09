import { shopifyFetch } from './client';
import type { ShopifyCart } from './types';

const CART_CREATE_MUTATION = `
  mutation CartCreate {
    cartCreate {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
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
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
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
  }
`;

type CartNode = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
  };
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
        };
      };
    }>;
  };
};

function mapCart(node: CartNode): ShopifyCart {
  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    subtotal: node.cost.subtotalAmount,
    lines: node.lines.edges.map(({ node: line }) => ({
      id: line.id,
      quantity: line.quantity,
      merchandiseId: line.merchandise.id,
      title: line.merchandise.title,
      price: line.merchandise.price,
    })),
  };
}

export async function createCart(): Promise<ShopifyCart | null> {
  try {
    const data = await shopifyFetch<{ cartCreate: { cart: CartNode } }>(CART_CREATE_MUTATION);
    return mapCart(data.cartCreate.cart);
  } catch {
    return null;
  }
}

export async function addToCart(
  cartId: string,
  merchandiseId: string,
  quantity = 1,
): Promise<ShopifyCart | null> {
  try {
    const data = await shopifyFetch<{ cartLinesAdd: { cart: CartNode } }>(
      CART_LINES_ADD_MUTATION,
      {
        cartId,
        lines: [{ merchandiseId, quantity }],
      },
    );
    return mapCart(data.cartLinesAdd.cart);
  } catch {
    return null;
  }
}
