import { useRecentlyViewedStore } from '../store/recentlyViewedStore';

export function useRecentlyViewed() {
  const entries = useRecentlyViewedStore((state) => state.entries);
  const trackProductView = useRecentlyViewedStore((state) => state.trackProductView);
  const hydrate = useRecentlyViewedStore((state) => state.hydrate);

  return {
    recentlyViewed: entries,
    recentProductIds: entries.map((entry) => entry.productId),
    trackProductView,
    hydrate,
  };
}
