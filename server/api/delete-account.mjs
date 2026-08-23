/**
 * Account deletion endpoint for the Stooping Club app.
 *
 * Deploy: run `npx vercel --prod` from the server/ folder, then set the
 * app's EXPO_PUBLIC_ACCOUNT_DELETION_URL to the deployed URL
 * (https://stooping-account-deletion.vercel.app/api/delete-account).
 *
 * Required environment variables (server-side only, never in the app):
 *   SHOPIFY_STORE_DOMAIN     e.g. d0iadx-mz.myshopify.com
 *   SHOPIFY_CLIENT_ID        Dev Dashboard / custom app Client ID
 *   SHOPIFY_CLIENT_SECRET    Client secret (shpss_...)
 * Optional:
 *   SHOPIFY_SHOP_ID          numeric shop id for Customer Account API
 *                            (defaults to 74832183474)
 *   SHOPIFY_API_VERSION      defaults to 2024-10
 *
 * Auth: client credentials grant
 *   https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant
 *
 * Flow:
 *   1. The app sends POST with "Authorization: Bearer <customer access token>".
 *   2. We verify the token against Shopify's Customer Account API.
 *   3. We exchange Client ID + Secret for a short-lived Admin access token,
 *      cache it (~24h), and call the Admin API with X-Shopify-Access-Token.
 *   4. No orders -> customerDelete; has orders -> customerRequestDataErasure.
 *   5. Respond { "status": "deleted" } or { "status": "erasure_requested" }.
 */

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? '';
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET ?? '';
const SHOP_ID = process.env.SHOPIFY_SHOP_ID ?? '74832183474';
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? '2024-10';

const CUSTOMER_API_URL = `https://shopify.com/${SHOP_ID}/account/customer/api/${API_VERSION}/graphql`;
const ADMIN_API_URL = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
const TOKEN_URL = `https://${STORE_DOMAIN}/admin/oauth/access_token`;

/** In-memory Admin token cache (survives warm serverless instances). */
let cachedAdminToken = null;
let cachedAdminTokenExpiresAt = 0;

class ShopNotPermittedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ShopNotPermittedError';
  }
}

async function getAdminAccessToken() {
  // Refresh 60s before expiry (Shopify tokens last ~24h / 86399s).
  if (cachedAdminToken && Date.now() < cachedAdminTokenExpiresAt - 60_000) {
    return cachedAdminToken;
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const bodyText = await response.text();
  let json = {};
  try {
    json = JSON.parse(bodyText);
  } catch {
    // Non-JSON body; handled via status below.
  }

  if (!response.ok) {
    const detail =
      json.error_description ?? json.error ?? bodyText ?? `status ${response.status}`;
    const combined = String(detail);

    if (
      combined.includes('shop_not_permitted') ||
      combined.includes('Client credentials cannot be performed on this shop')
    ) {
      throw new ShopNotPermittedError(
        'Oauth error shop_not_permitted: Client credentials cannot be performed on this shop. Need authorization-code flow instead.',
      );
    }

    throw new Error(`Shopify token request failed: ${response.status} (${combined})`);
  }

  const { access_token, expires_in } = json;
  if (!access_token) {
    throw new Error('Shopify token response missing access_token.');
  }

  cachedAdminToken = access_token;
  cachedAdminTokenExpiresAt = Date.now() + (Number(expires_in) || 86_399) * 1000;
  return cachedAdminToken;
}

async function fetchCustomerIdFromToken(customerAccessToken) {
  const response = await fetch(CUSTOMER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: customerAccessToken,
    },
    body: JSON.stringify({ query: 'query { customer { id } }' }),
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json?.data?.customer?.id ?? null;
}

async function adminGraphql(query, variables) {
  const accessToken = await getAdminAccessToken();

  const response = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (!response.ok || json.errors?.length) {
    const message = json.errors?.[0]?.message ?? `Admin API request failed (${response.status})`;
    throw new Error(message);
  }
  return json.data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  if (!STORE_DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
    res.status(500).json({ error: 'Server is not configured.' });
    return;
  }

  const authHeader = req.headers.authorization ?? '';
  const customerAccessToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!customerAccessToken) {
    res.status(401).json({ error: 'Missing customer access token.' });
    return;
  }

  try {
    // Authenticate: the token must resolve to a real customer of this shop.
    const customerId = await fetchCustomerIdFromToken(customerAccessToken);
    if (!customerId) {
      res.status(401).json({ error: 'Invalid or expired session. Sign in again.' });
      return;
    }

    const customerData = await adminGraphql(
      `query CustomerOrderCount($id: ID!) {
        customer(id: $id) {
          id
          numberOfOrders
        }
      }`,
      { id: customerId },
    );

    const customer = customerData.customer;
    if (!customer) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }

    const hasOrders = Number(customer.numberOfOrders) > 0;

    if (!hasOrders) {
      const deleteData = await adminGraphql(
        `mutation DeleteCustomer($input: CustomerDeleteInput!) {
          customerDelete(input: $input) {
            deletedCustomerId
            userErrors {
              field
              message
            }
          }
        }`,
        { input: { id: customerId } },
      );

      const deleteErrors = deleteData.customerDelete?.userErrors ?? [];
      if (deleteErrors.length > 0) {
        throw new Error(deleteErrors[0].message);
      }

      res.status(200).json({ status: 'deleted' });
      return;
    }

    // Customers with orders can't be hard-deleted; Shopify's data-erasure
    // request redacts their personal data instead (GDPR/CCPA flow).
    const erasureData = await adminGraphql(
      `mutation RequestErasure($customerId: ID!) {
        customerRequestDataErasure(customerId: $customerId) {
          customerId
          userErrors {
            field
            message
          }
        }
      }`,
      { customerId },
    );

    const erasureErrors = erasureData.customerRequestDataErasure?.userErrors ?? [];
    if (erasureErrors.length > 0) {
      throw new Error(erasureErrors[0].message);
    }

    res.status(200).json({ status: 'erasure_requested' });
  } catch (error) {
    if (error instanceof ShopNotPermittedError) {
      res.status(501).json({
        error: error.message,
        code: 'shop_not_permitted',
      });
      return;
    }

    const message = error instanceof Error ? error.message : 'Account deletion failed.';
    res.status(502).json({ error: message });
  }
}
