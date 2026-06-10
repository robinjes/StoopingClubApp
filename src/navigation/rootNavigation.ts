import { createNavigationContainerRef } from '@react-navigation/native';

import type { TabParamList } from './TabNavigator';

export const rootNavigationRef = createNavigationContainerRef<TabParamList>();

export function navigateToShopTab() {
  if (rootNavigationRef.isReady()) {
    rootNavigationRef.navigate('ShopTab');
  }
}

export function navigateToHomeTab() {
  if (rootNavigationRef.isReady()) {
    rootNavigationRef.navigate('HomeTab');
  }
}
