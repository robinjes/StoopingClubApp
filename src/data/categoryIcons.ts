import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export const CATEGORY_ICONS: Record<string, IoniconName> = {
  apparel: 'shirt-outline',
  accessories: 'watch-outline',
  art: 'color-palette-outline',
  'baby-products': 'happy-outline',
  'bags-storage': 'bag-outline',
  'bathroom-shower': 'water-outline',
  books: 'book-outline',
  costumes: 'sparkles-outline',
  dvds: 'disc-outline',
  furniture: 'bed-outline',
  'gift-wrapping': 'gift-outline',
  health: 'heart-outline',
  'holiday-decor': 'snow-outline',
  'home-decor': 'home-outline',
  'home-improvement': 'hammer-outline',
  collectibles: 'diamond-outline',
  household: 'basket-outline',
  kitchenware: 'restaurant-outline',
  music: 'musical-notes-outline',
  'school-office': 'school-outline',
  shoes: 'footsteps-outline',
  sports: 'football-outline',
  technology: 'laptop-outline',
  toys: 'game-controller-outline',
  uncategorized: 'help-circle-outline',
  recent: 'time-outline',
};

export function getCategoryIcon(categoryId: string): IoniconName {
  return CATEGORY_ICONS[categoryId] ?? 'grid-outline';
}
