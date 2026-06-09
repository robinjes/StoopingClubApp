import { useEffect } from 'react';

import { OverlayProvider } from '../context/OverlayContext';
import { prefetchShopData } from '../hooks/useShopData';
import AppShell from './AppShell';

export default function AppNavigator() {
  useEffect(() => {
    void prefetchShopData();
  }, []);

  return (
    <OverlayProvider>
      <AppShell />
    </OverlayProvider>
  );
}
