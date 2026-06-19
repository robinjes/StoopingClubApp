import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const RECENTLY_VIEWED_KEY = 'recently_viewed_products_v2';
const V1_RECENTLY_VIEWED_KEY = 'recently_viewed_products';
const LEGACY_RECENTLY_VIEWED_KEY = 'recently_viewed_product_ids';
export const MAX_RECENTLY_VIEWED_ITEMS = 25;
export const HOME_RECENTLY_VIEWED_LIMIT = 3;

export type RecentlyViewedEntry = {
  productId: string;
  viewedAt: string | null;
};

type RecentlyViewedStore = {
  entries: RecentlyViewedEntry[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  trackProductView: (productId: string) => Promise<void>;
};

function isValidEntry(entry: unknown): entry is RecentlyViewedEntry {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const candidate = entry as RecentlyViewedEntry;
  return (
    typeof candidate.productId === 'string' &&
    (typeof candidate.viewedAt === 'string' || candidate.viewedAt === null)
  );
}

/** Older migrations stamped every item with the same time — strip those bad timestamps. */
function stripBatchMigratedTimestamps(entries: RecentlyViewedEntry[]): RecentlyViewedEntry[] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    if (!entry.viewedAt) {
      continue;
    }

    counts.set(entry.viewedAt, (counts.get(entry.viewedAt) ?? 0) + 1);
  }

  const duplicatedTimes = new Set(
    [...counts.entries()].filter(([, count]) => count > 1).map(([viewedAt]) => viewedAt),
  );

  if (duplicatedTimes.size === 0) {
    return entries;
  }

  return entries.map((entry) =>
    entry.viewedAt && duplicatedTimes.has(entry.viewedAt)
      ? { ...entry, viewedAt: null }
      : entry,
  );
}

async function readStoredEntries(): Promise<RecentlyViewedEntry[]> {
  const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as unknown[];
      if (Array.isArray(parsed)) {
        return stripBatchMigratedTimestamps(parsed.filter(isValidEntry));
      }
    } catch {
      // Fall through to older formats.
    }
  }

  const v1Stored = await AsyncStorage.getItem(V1_RECENTLY_VIEWED_KEY);
  if (v1Stored) {
    try {
      const parsed = JSON.parse(v1Stored) as unknown[];
      if (Array.isArray(parsed)) {
        const migrated = stripBatchMigratedTimestamps(
          parsed
            .filter(isValidEntry)
            .map((entry) => ({
              productId: entry.productId,
              viewedAt: entry.viewedAt,
            })),
        );

        await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(migrated));
        await AsyncStorage.removeItem(V1_RECENTLY_VIEWED_KEY);
        return migrated;
      }
    } catch {
      // Fall through to legacy IDs.
    }
  }

  const legacy = await AsyncStorage.getItem(LEGACY_RECENTLY_VIEWED_KEY);
  if (!legacy) {
    return [];
  }

  try {
    const parsed = JSON.parse(legacy) as string[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    const migrated = parsed.map((productId) => ({
      productId,
      viewedAt: null,
    }));

    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(migrated));
    await AsyncStorage.removeItem(LEGACY_RECENTLY_VIEWED_KEY);
    return migrated;
  } catch {
    return [];
  }
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>((set, get) => ({
  entries: [],
  isHydrated: false,
  hydrate: async () => {
    const entries = await readStoredEntries();
    set({ entries, isHydrated: true });
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(entries));
  },
  trackProductView: async (productId) => {
    const viewedAt = new Date().toISOString();
    const next = [
      { productId, viewedAt },
      ...get().entries.filter((entry) => entry.productId !== productId),
    ].slice(0, MAX_RECENTLY_VIEWED_ITEMS);

    set({ entries: next, isHydrated: true });
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  },
}));

export function getTrackedRecentlyViewed(entries: RecentlyViewedEntry[]): RecentlyViewedEntry[] {
  return entries.filter((entry) => entry.viewedAt !== null);
}
