import AsyncStorage from '@react-native-async-storage/async-storage';

import { LOCAL_PICKUP_CONFIRMATIONS_KEY } from '../../api/customerOrders';
import { CART_ID_KEY } from '../../context/CartContext';
import {
  LEGACY_RECENTLY_VIEWED_KEY,
  RECENTLY_VIEWED_KEY,
  V1_RECENTLY_VIEWED_KEY,
  useRecentlyViewedStore,
} from '../../store/recentlyViewedStore';
import {
  LEGACY_STREAK_STORAGE_KEY,
  STREAK_STORAGE_KEY,
  useStreakStore,
} from '../../store/streakStore';

/**
 * URL of the server-side deletion endpoint (see server/api/delete-account.mjs).
 * The Shopify Admin API call must happen on the server, never in the app.
 */
const ACCOUNT_DELETION_URL = process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL ?? '';

export type AccountDeletionResult = 'deleted' | 'erasure_requested';

type DeletionResponse = {
  status?: string;
  error?: string;
};

export function isAccountDeletionConfigured(): boolean {
  return ACCOUNT_DELETION_URL.startsWith('https://');
}

/**
 * Asks the backend to delete the signed-in Shopify customer.
 * The backend verifies the customer token, then either deletes the customer
 * (no orders) or files a Shopify data-erasure request (has orders).
 */
export async function requestAccountDeletion(
  customerAccessToken: string,
): Promise<AccountDeletionResult> {
  if (!isAccountDeletionConfigured()) {
    throw new Error(
      'Account deletion is not available right now. Please contact support@stoopingclub.org.',
    );
  }

  let response: Response;
  try {
    response = await fetch(ACCOUNT_DELETION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAccessToken}`,
      },
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  let json: DeletionResponse = {};
  try {
    json = (await response.json()) as DeletionResponse;
  } catch {
    // Non-JSON response; fall through to status check below.
  }

  if (!response.ok) {
    throw new Error(json.error ?? `Account deletion failed (${response.status}). Try again.`);
  }

  if (json.status === 'deleted' || json.status === 'erasure_requested') {
    return json.status;
  }

  throw new Error('The server returned an unexpected response. Try again.');
}

/**
 * Removes all Stooping user data stored on this device.
 * Auth tokens are cleared separately by logout; device preferences
 * (theme, sounds) are intentionally kept.
 */
export async function clearLocalUserData(): Promise<void> {
  await AsyncStorage.multiRemove([
    CART_ID_KEY,
    LOCAL_PICKUP_CONFIRMATIONS_KEY,
    STREAK_STORAGE_KEY,
    LEGACY_STREAK_STORAGE_KEY,
    RECENTLY_VIEWED_KEY,
    V1_RECENTLY_VIEWED_KEY,
    LEGACY_RECENTLY_VIEWED_KEY,
  ]);

  // Reset in-memory stores so the cleared state is reflected immediately.
  await Promise.all([
    useStreakStore.getState().hydrate(),
    useRecentlyViewedStore.getState().hydrate(),
  ]);
}
