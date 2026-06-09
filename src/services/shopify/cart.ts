import { shopifyFetch } from './client';
import type { ShopifyCart } from './types';

const CART_FIELDS = `
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
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
            product {
              title
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate {
    cartCreate {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FIELDS}
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
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
          image?: { url: string; altText?: string | null } | null;
          price: { amount: string; currencyCode: string };
          product: { title: string };
        };
      };
    }>;
  };
};

function mapCart(node: CartNode | null): ShopifyCart | null {
  if (!node) {
    return null;
  }

  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    subtotal: node.cost.subtotalAmount,
    lines: node.lines.edges.map(({ node: line }) => ({
      id: line.id,
      quantity: line.quantity,
      merchandiseId: line.merchandise.id,
      title: line.merchandise.product.title || line.merchandise.title,
      imageUrl: line.merchandise.image?.url ?? null,
      price: line.merchandise.price,
    })),
  };
}

function getUserError(errors: Array<{ message: string }> | undefined): string | null {
  return errors?.[0]?.message ?? null;
}

export async function createCart(): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cartCreate: { cart: CartNode; userErrors: Array<{ message: string }> } }>(
    CART_CREATE_MUTATION,
  );

  const userError = getUserError(data.cartCreate.userErrors);
  if (userError) {
    throw new Error(userError);
  }

  return mapCart(data.cartCreate.cart);
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: CartNode | null }>(CART_QUERY, { cartId });
  return mapCart(data.cart);
}

export async function addToCart(
  cartId: string,
  merchandiseId: string,
  quantity = 1,
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: CartNode; userErrors: Array<{ message: string }> };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ merchandiseId, quantity }],
  });

  const userError = getUserError(data.cartLinesAdd.userErrors);
  if (userError) {
    throw new Error(userError);
  }

  return mapCart(data.cartLinesAdd.cart);
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: CartNode; userErrors: Array<{ message: string }> };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userError = getUserError(data.cartLinesUpdate.userErrors);
  if (userError) {
    throw new Error(userError);
  }

  return mapCart(data.cartLinesUpdate.cart);
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: CartNode; userErrors: Array<{ message: string }> };
  }>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds,
  });

  const userError = getUserError(data.cartLinesRemove.userErrors);
  if (userError) {
    throw new Error(userError);
  }

  return mapCart(data.cartLinesRemove.cart);
}
