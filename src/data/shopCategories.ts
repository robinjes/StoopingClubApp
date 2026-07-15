/**
 * Shop categories aligned with Stooping Club Berkeley web collection names.
 * Handles map to Shopify collection handles from the live storefront.
 */
export type ShopCategoryDefinition = {
  id: string;
  label: string;
  parentId?: string;
  collectionHandles?: string[];
  tagMatches?: string[];
  special?: 'recent' | 'uncategorized';
};

export const SHOP_CATEGORIES: ShopCategoryDefinition[] = [
  {
    id: 'donors-volunteers',
    label: '*Donors & Volunteers Only*',
    collectionHandles: ['4th-of-july-special'],
    tagMatches: ['Donors & Volunteers Only', 'Donors', 'Volunteers'],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    collectionHandles: ['accessories-1'],
    tagMatches: ['Accessories'],
  },
  {
    id: 'apparel',
    label: 'Apparel',
    collectionHandles: ['apparel-1'],
    tagMatches: ['Apparel', 'Clothing'],
  },
  {
    id: 'art',
    label: 'Art',
    collectionHandles: ['art'],
    tagMatches: ['Art'],
  },
  {
    id: 'books-dvds',
    label: 'Books & DVDs',
    collectionHandles: ['books-dvds', 'books'],
    tagMatches: ['Books & DVDs', 'Books', 'DVDs', 'DVD'],
  },
  {
    id: 'cal-merch',
    label: 'Cal Merch',
    collectionHandles: ['cal-merch'],
    tagMatches: ['Cal Merch', 'Cal'],
  },
  {
    id: 'collectibles',
    label: 'Collectibles',
    collectionHandles: ['collectibles-1'],
    tagMatches: ['Collectibles', 'Collectible'],
  },
  {
    id: 'costume-jewelry',
    label: 'Costume Jewelry',
    collectionHandles: ['costume-jewelry-1'],
    tagMatches: ['Costume Jewelry', 'Jewelry'],
  },
  {
    id: 'dorm-essentials',
    label: 'Dorm Essentials',
    collectionHandles: ['dorm-essentials'],
    tagMatches: ['Dorm Essentials', 'Dorm'],
  },
  {
    id: 'electronics',
    label: 'Electronics',
    collectionHandles: ['electronics'],
    tagMatches: ['Electronics', 'Technology'],
  },
  {
    id: 'food',
    label: 'Food',
    collectionHandles: ['food'],
    tagMatches: ['Food'],
  },
  {
    id: 'garden-florals',
    label: 'Garden & Florals',
    collectionHandles: ['garden-florals'],
    tagMatches: ['Garden & Florals', 'Garden', 'Florals'],
  },
  {
    id: 'health-beauty',
    label: 'Health & Beauty',
    collectionHandles: ['health-beauty', 'health-and-beauty'],
    tagMatches: ['Health & Beauty', 'Health', 'Beauty'],
  },
  {
    id: 'holiday',
    label: 'Holiday',
    collectionHandles: ['holiday-1'],
    tagMatches: ['Holiday'],
  },
  {
    id: 'home-decor',
    label: 'Home Decor',
    collectionHandles: ['home-decor'],
    tagMatches: ['Home Decor'],
  },
  {
    id: 'home-improvement',
    label: 'Home Improvement',
    collectionHandles: ['home-improvement-1'],
    tagMatches: ['Home Improvement'],
  },
  {
    id: 'household',
    label: 'Household Items',
    collectionHandles: ['household-items'],
    tagMatches: ['Household Items', 'Household'],
  },
  {
    id: 'kitchenware',
    label: 'Kitchenware',
    collectionHandles: ['kitchenware'],
    tagMatches: ['Kitchenware'],
  },
  {
    id: 'music-instruments',
    label: 'Music & Instruments',
    collectionHandles: ['music-instruments', 'musical-instruments'],
    tagMatches: ['Music & Instruments', 'Music', 'Instruments'],
  },
  {
    id: 'party-supplies',
    label: 'Party Supplies',
    collectionHandles: ['party-supplies'],
    tagMatches: ['Party Supplies', 'Party'],
  },
  {
    id: 'pet-supplies',
    label: 'Pet Supplies',
    collectionHandles: ['pet-supplies-1'],
    tagMatches: ['Pet Supplies', 'Pet'],
  },
  {
    id: 'school-office',
    label: 'School & Office Supplies',
    collectionHandles: ['school-office-supplies'],
    tagMatches: ['School & Office Supplies', 'School', 'Office Supplies'],
  },
  {
    id: 'sports',
    label: 'Sports',
    collectionHandles: ['sports'],
    tagMatches: ['Sports', 'Exercise'],
  },
  {
    id: 'toys-games',
    label: 'Toys & Games',
    collectionHandles: ['toys-games-1'],
    tagMatches: ['Toys & Games', 'Toys', 'Games'],
  },
  {
    id: 'water-bottles',
    label: 'Water Bottles',
    collectionHandles: ['water-bottles'],
    tagMatches: ['Water Bottles', 'Water Bottle'],
  },
  {
    id: 'furniture',
    label: 'Furniture',
    collectionHandles: ['furniture'],
    tagMatches: ['Furniture'],
  },
  {
    id: 'baby',
    label: 'Baby',
    collectionHandles: ['baby-1', 'baby'],
    tagMatches: ['Baby'],
  },
  {
    id: 'uncategorized',
    label: 'Uncategorized',
    special: 'uncategorized',
  },
  {
    id: 'recent',
    label: 'Recently Viewed Items',
    special: 'recent',
  },
];
