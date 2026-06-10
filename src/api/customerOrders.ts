import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  NO_SHOW_METAFIELD_NAMESPACE,
  PICKUP_CONFIRMED_AT_KEY,
  PICKUP_CONFIRMED_KEY,
} from '../constants/noShow';
import { customerAccountFetch } from '../services/shopify/customerApi';
import type { CustomerOrder, CustomerProfile } from '../types/customer';

const LOCAL_PICKUP_CONFIRMATIONS_KEY = 'local_pickup_confirmations';

type MetafieldNode = {
  namespace: string;
  key: string;
  value: string;
} | null;

type CustomerOrdersResponse = {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddress: {
      emailAddress: string;
    } | null;
    orders: {
      nodes: Array<{
        id: string;
        name: string;
        number: number;
        processedAt: string;
        fulfillmentStatus: string;
        fulfillments: {
          nodes: Array<{
            id: string;
            status: string | null;
            isPickedUp: boolean;
          }>;
        };
        metafields: MetafieldNode[];
      }>;
    };
  } | null;
};

type MetafieldsSetResponse = {
  metafieldsSet: {
    metafields: Array<{
      namespace: string;
      key: string;
      value: string;
    }> | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
      code: string | null;
    }>;
  };
};

const CUSTOMER_ORDERS_QUERY = `
  query CustomerOrders {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      orders(first: 25, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          number
          processedAt
          fulfillmentStatus
          fulfillments(first: 5) {
            nodes {
              id
              status
              isPickedUp
            }
          }
          metafields(identifiers: [
            { namespace: "${NO_SHOW_METAFIELD_NAMESPACE}", key: "${PICKUP_CONFIRMED_KEY}" },
            { namespace: "${NO_SHOW_METAFIELD_NAMESPACE}", key: "${PICKUP_CONFIRMED_AT_KEY}" }
          ]) {
            namespace
            key
            value
          }
        }
      }
    }
  }
`;

const CONFIRM_PICKUP_MUTATION = `
  mutation ConfirmPickup($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        namespace
        key
        value
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

async function loadLocalPickupConfirmations(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(LOCAL_PICKUP_CONFIRMATIONS_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

async function saveLocalPickupConfirmation(orderId: string, confirmedAt: string): Promise<void> {
  const existing = await loadLocalPickupConfirmations();
  existing[orderId] = confirmedAt;
  await AsyncStorage.setItem(LOCAL_PICKUP_CONFIRMATIONS_KEY, JSON.stringify(existing));
}

type OrderNode = CustomerOrdersResponse['customer'] extends infer Customer
  ? Customer extends { orders: { nodes: infer Nodes } }
    ? Nodes extends Array<infer Node>
      ? Node
      : never
    : never
  : never;

function mapOrderNode(node: OrderNode, localConfirmations: Record<string, string>): CustomerOrder {
  const metafields = node.metafields.filter(Boolean) as Array<{
    namespace: string;
    key: string;
    value: string;
  }>;

  const pickupConfirmedField = metafields.find((field) => field.key === PICKUP_CONFIRMED_KEY);
  const pickupConfirmedAtField = metafields.find((field) => field.key === PICKUP_CONFIRMED_AT_KEY);
  const localConfirmedAt = localConfirmations[node.id] ?? null;

  return {
    id: node.id,
    name: node.name,
    number: node.number,
    processedAt: node.processedAt,
    fulfillmentStatus: node.fulfillmentStatus,
    fulfillments: node.fulfillments.nodes.map((fulfillment) => ({
      id: fulfillment.id,
      status: fulfillment.status,
      isPickedUp: fulfillment.isPickedUp,
    })),
    pickupConfirmed: pickupConfirmedField?.value === 'true' || Boolean(localConfirmedAt),
    pickupConfirmedAt: pickupConfirmedAtField?.value ?? localConfirmedAt,
  };
}

export async function fetchCustomerProfileAndOrders(
  accessToken: string,
): Promise<{ profile: CustomerProfile | null; orders: CustomerOrder[] }> {
  const [data, localConfirmations] = await Promise.all([
    customerAccountFetch<CustomerOrdersResponse>(CUSTOMER_ORDERS_QUERY, accessToken),
    loadLocalPickupConfirmations(),
  ]);

  if (!data.customer) {
    return { profile: null, orders: [] };
  }

  const profile: CustomerProfile = {
    id: data.customer.id,
    email: data.customer.emailAddress?.emailAddress ?? null,
    firstName: data.customer.firstName,
    lastName: data.customer.lastName,
  };

  const orders = data.customer.orders.nodes.map((node) => mapOrderNode(node, localConfirmations));

  return { profile, orders };
}

export async function confirmOrderPickup(
  accessToken: string,
  orderId: string,
): Promise<CustomerOrder | null> {
  const confirmedAt = new Date().toISOString();

  try {
    const data = await customerAccountFetch<MetafieldsSetResponse>(
      CONFIRM_PICKUP_MUTATION,
      accessToken,
      {
        metafields: [
          {
            ownerId: orderId,
            namespace: NO_SHOW_METAFIELD_NAMESPACE,
            key: PICKUP_CONFIRMED_KEY,
            type: 'boolean',
            value: 'true',
          },
          {
            ownerId: orderId,
            namespace: NO_SHOW_METAFIELD_NAMESPACE,
            key: PICKUP_CONFIRMED_AT_KEY,
            type: 'date_time',
            value: confirmedAt,
          },
        ],
      },
    );

    const userError = data.metafieldsSet.userErrors[0];
    if (userError) {
      throw new Error(userError.message);
    }
  } catch {
    await saveLocalPickupConfirmation(orderId, confirmedAt);
  }

  const { orders } = await fetchCustomerProfileAndOrders(accessToken);
  return orders.find((order) => order.id === orderId) ?? null;
}
