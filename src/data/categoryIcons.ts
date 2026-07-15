import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export const CATEGORY_ICONS: Record<string, IoniconName> = {
  'donors-volunteers': 'heart-outline',
  accessories: 'watch-outline',
  apparel: 'shirt-outline',
  art: 'color-palette-outline',
  'books-dvds': 'book-outline',
  'cal-merch': 'school-outline',
  collectibles: 'diamond-outline',
  'costume-jewelry': 'sparkles-outline',
  'dorm-essentials': 'bed-outline',
  electronics: 'laptop-outline',
  food: 'nutrition-outline',
  'garden-florals': 'leaf-outline',
  'health-beauty': 'heart-outline',
  holiday: 'snow-outline',
  'home-decor': 'home-outline',
  'home-improvement': 'hammer-outline',
  household: 'basket-outline',
  kitchenware: 'restaurant-outline',
  'music-instruments': 'musical-notes-outline',
  'party-supplies': 'gift-outline',
  'pet-supplies': 'paw-outline',
  'school-office': 'pencil-outline',
  sports: 'football-outline',
  'toys-games': 'game-controller-outline',
  'water-bottles': 'water-outline',
  furniture: 'bed-outline',
  baby: 'happy-outline',
  uncategorized: 'help-circle-outline',
  recent: 'time-outline',
};

export function getCategoryIcon(categoryId: string): IoniconName {
  return CATEGORY_ICONS[categoryId] ?? 'grid-outline';
}
