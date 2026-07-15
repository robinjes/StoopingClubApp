import { useEffect } from 'react';

import { OverlayProvider } from '../context/OverlayContext';
import { NavLayoutProvider } from '../context/NavLayoutContext';
import { FlyToCartProvider } from '../context/FlyToCartContext';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { prefetchShopData } from '../hooks/useShopData';
import { useRecentlyViewedStore } from '../store/recentlyViewedStore';
import { useStreakStore } from '../store/streakStore';
import AppShell from './AppShell';

export default function AppNavigator() {
  useStreakTracking(true);

  useEffect(() => {
    void prefetchShopData();
    void useRecentlyViewedStore.getState().hydrate();
    void useStreakStore.getState().hydrate();
  }, []);

  return (
    <OverlayProvider>
      <NavLayoutProvider>
        <FlyToCartProvider>
          <AppShell />
        </FlyToCartProvider>
      </NavLayoutProvider>
    </OverlayProvider>
  );
}
