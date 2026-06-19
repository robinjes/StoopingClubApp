export type FeaturedCategory = {
  id: string;
  label: string;
  categoryId: string;
  collectionHandle: string;
};

export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  { id: 'apparel', label: 'Apparel', categoryId: 'apparel', collectionHandle: 'apparel-1' },
  {
    id: 'home-decor',
    label: 'Home Decor',
    categoryId: 'home-decor',
    collectionHandle: 'home-decor',
  },
  {
    id: 'kitchenware',
    label: 'Kitchenware',
    categoryId: 'kitchenware',
    collectionHandle: 'kitchenware',
  },
  {
    id: 'home-improvement',
    label: 'Home Improvement',
    categoryId: 'home-improvement',
    collectionHandle: 'home-improvement-1',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    categoryId: 'accessories',
    collectionHandle: 'accessories-1',
  },
  {
    id: 'collectibles',
    label: 'Collectibles',
    categoryId: 'collectibles',
    collectionHandle: 'collectibles-1',
  },
  {
    id: 'holiday',
    label: 'Holiday',
    categoryId: 'holiday-decor',
    collectionHandle: 'holiday-1',
  },
  {
    id: 'toys-games',
    label: 'Toys & Games',
    categoryId: 'toys',
    collectionHandle: 'toys-games-1',
  },
];
