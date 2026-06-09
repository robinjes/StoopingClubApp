import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const RECENTLY_VIEWED_KEY = 'recently_viewed_product_ids';
const MAX_RECENT_ITEMS = 25;

export function useRecentlyViewed() {
  const [recentProductIds, setRecentProductIds] = useState<string[]>([]);

  useEffect(() => {
    void AsyncStorage.getItem(RECENTLY_VIEWED_KEY).then((value) => {
      if (!value) {
        return;
      }

      try {
        const parsed = JSON.parse(value) as string[];
        if (Array.isArray(parsed)) {
          setRecentProductIds(parsed);
        }
      } catch {
        setRecentProductIds([]);
      }
    });
  }, []);

  const trackProductView = useCallback(async (productId: string) => {
    setRecentProductIds((current) => {
      const next = [productId, ...current.filter((id) => id !== productId)].slice(0, MAX_RECENT_ITEMS);
      void AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recentProductIds, trackProductView };
}
