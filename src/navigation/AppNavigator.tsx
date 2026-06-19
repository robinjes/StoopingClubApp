import { useEffect } from 'react';

import { OverlayProvider } from '../context/OverlayContext';
import { prefetchShopData } from '../hooks/useShopData';
import { useRecentlyViewedStore } from '../store/recentlyViewedStore';
import { useWishlistStore } from '../store/wishlistStore';
import AppShell from './AppShell';

export default function AppNavigator() {
  useEffect(() => {
    void prefetchShopData();
    void useWishlistStore.getState().hydrate();
    void useRecentlyViewedStore.getState().hydrate();
  }, []);

  return (
    <OverlayProvider>
      <AppShell />
    </OverlayProvider>
  );
}
