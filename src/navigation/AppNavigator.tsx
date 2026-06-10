import { useEffect } from 'react';

import { OverlayProvider } from '../context/OverlayContext';
import { prefetchShopData } from '../hooks/useShopData';
import { useWishlistStore } from '../store/wishlistStore';
import AppShell from './AppShell';

export default function AppNavigator() {
  useEffect(() => {
    void prefetchShopData();
    void useWishlistStore.getState().hydrate();
  }, []);

  return (
    <OverlayProvider>
      <AppShell />
    </OverlayProvider>
  );
}
