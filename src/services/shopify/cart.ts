import { shopifyFetch } from './client';
import type { ShopifyCart } from './types';
import {
  moneyAmount,
  parseEstRetailAmount,
  parseMetafieldMoney,
} from '../../utils/estRetailValue';

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  note
  attributes {
    key
    value
  }
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
            compareAtPrice {
              amount
              currencyCode
            }
            product {
              title
              handle
              description
              descriptionHtml
              metafields(identifiers: [
                { namespace: "custom", key: "typical_retail_value_estimate" }
                { namespace: "custom", key: "est_retail_value" }
                { namespace: "custom", key: "estimated_retail_value" }
                { namespace: "custom", key: "retail_value" }
                { namespace: "custom", key: "est_retail" }
              ]) {
                namespace
                key
                value
                type
              }
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

const CART_NOTE_UPDATE_MUTATION = `
  mutation CartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
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

const CART_ATTRIBUTES_UPDATE_MUTATION = `
  mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
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
  note: string | null;
  attributes: Array<{ key: string; value: string }>;
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
          compareAtPrice?: { amount: string; currencyCode: string } | null;
          product: {
            title: string;
            handle?: string;
            description?: string;
            descriptionHtml?: string;
            metafields?: Array<{
              namespace: string;
              key: string;
              value: string;
              type: string;
            } | null>;
          };
        };
      };
    }>;
  };
};

function resolveLineEstRetail(
  merchandise: CartNode['lines']['edges'][number]['node']['merchandise'],
): number | null {
  const metafields = merchandise.product.metafields?.filter(Boolean) ?? [];
  for (const field of metafields) {
    if (!field) {
      continue;
    }
    const money = parseMetafieldMoney(field.value, merchandise.price.currencyCode);
    if (money) {
      return moneyAmount(money);
    }
  }

  const fromDescription = parseEstRetailAmount(
    merchandise.product.descriptionHtml,
    merchandise.product.description,
  );
  if (fromDescription != null) {
    return fromDescription;
  }

  const compareAmount = moneyAmount(merchandise.compareAtPrice);
  return compareAmount > 0 ? compareAmount : null;
}

function mapCart(node: CartNode | null): ShopifyCart | null {
  if (!node) {
    return null;
  }

  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    subtotal: node.cost.subtotalAmount,
    note: node.note,
    attributes: node.attributes,
    lines: node.lines.edges.map(({ node: line }) => ({
      id: line.id,
      quantity: line.quantity,
      merchandiseId: line.merchandise.id,
      title: line.merchandise.product.title || line.merchandise.title,
      imageUrl: line.merchandise.image?.url ?? null,
      price: line.merchandise.price,
      estRetailValue: resolveLineEstRetail(line.merchandise),
      productHandle: line.merchandise.product.handle ?? null,
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

export async function updateCartCheckoutDetails(
  cart: ShopifyCart,
  note: string,
  phoneNumber: string,
): Promise<ShopifyCart | null> {
  const noteData = await shopifyFetch<{
    cartNoteUpdate: { cart: CartNode; userErrors: Array<{ message: string }> };
  }>(CART_NOTE_UPDATE_MUTATION, { cartId: cart.id, note });

  const noteError = getUserError(noteData.cartNoteUpdate.userErrors);
  if (noteError) {
    throw new Error(noteError);
  }

  const attributes = [
    ...cart.attributes.filter(({ key }) => key !== 'Mobile number'),
    { key: 'Mobile number', value: phoneNumber },
  ];
  const attributesData = await shopifyFetch<{
    cartAttributesUpdate: { cart: CartNode; userErrors: Array<{ message: string }> };
  }>(CART_ATTRIBUTES_UPDATE_MUTATION, { cartId: cart.id, attributes });

  const attributesError = getUserError(attributesData.cartAttributesUpdate.userErrors);
  if (attributesError) {
    throw new Error(attributesError);
  }

  return mapCart(attributesData.cartAttributesUpdate.cart);
}
