import { useRecentlyViewedStore } from '../store/recentlyViewedStore';

export function useRecentlyViewed() {
  const entries = useRecentlyViewedStore((state) => state.entries);
  const trackProductView = useRecentlyViewedStore((state) => state.trackProductView);

  return {
    recentProductIds: entries.map((entry) => entry.productId),
    trackProductView,
  };
}
