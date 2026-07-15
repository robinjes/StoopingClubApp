import { createNavigationContainerRef } from '@react-navigation/native';

import type { OrderMessagePreviewParams } from './stacks/ShopStack';
import type { TabParamList } from './TabNavigator';

export const rootNavigationRef = createNavigationContainerRef<TabParamList>();

export function navigateToShopTab() {
  if (rootNavigationRef.isReady()) {
    rootNavigationRef.navigate('ShopTab');
  }
}

export function navigateToOrderMessagePreview(params: OrderMessagePreviewParams) {
  if (rootNavigationRef.isReady()) {
    rootNavigationRef.navigate('ShopTab', {
      screen: 'OrderMessagePreview',
      params,
    });
  }
}
