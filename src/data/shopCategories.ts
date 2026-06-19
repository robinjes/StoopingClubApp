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
    id: 'apparel',
    label: 'Apparel',
    collectionHandles: ['apparel-1'],
    tagMatches: ['Apparel', 'Clothing'],
  },
  { id: 'accessories', label: 'Accessories', collectionHandles: ['accessories-1'], tagMatches: ['Accessories'] },
  { id: 'art', label: 'Art', collectionHandles: ['art'], tagMatches: ['Art'] },
  { id: 'baby-products', label: 'Baby Products', collectionHandles: ['baby'], tagMatches: ['Baby'] },
  { id: 'bags-storage', label: 'Bags and Storage', tagMatches: ['Bags', 'Storage'] },
  { id: 'bathroom-shower', label: 'Bathroom & Shower', tagMatches: ['Bathroom', 'Shower'] },
  {
    id: 'books',
    label: 'Books',
    collectionHandles: ['books'],
    tagMatches: ['Books', 'Books & DVDs'],
  },
  { id: 'books-nonfiction', label: 'Nonfiction', parentId: 'books', tagMatches: ['Nonfiction'] },
  { id: 'books-test-prep', label: 'Test Prep', parentId: 'books', tagMatches: ['Test Prep'] },
  { id: 'costumes', label: 'Costumes and Special Outfits', tagMatches: ['Costume', 'Outfit'] },
  { id: 'dvds', label: 'DVDs', collectionHandles: ['books'], tagMatches: ['DVD'] },
  { id: 'furniture', label: 'Furniture', collectionHandles: ['furniture'], tagMatches: ['Furniture'] },
  { id: 'gift-wrapping', label: 'Gift Wrapping', tagMatches: ['Gift Wrapping', 'Gift Wrap'] },
  {
    id: 'health',
    label: 'Health and Self-Care',
    collectionHandles: ['health-and-beauty'],
    tagMatches: ['Health', 'Beauty', 'Self-Care'],
  },
  { id: 'holiday-decor', label: 'Holiday Decor', collectionHandles: ['holiday-1'], tagMatches: ['Holiday'] },
  { id: 'home-decor', label: 'Home Decor', collectionHandles: ['home-decor'], tagMatches: ['Home Decor'] },
  {
    id: 'home-improvement',
    label: 'Home Improvement',
    collectionHandles: ['home-improvement-1'],
    tagMatches: ['Home Improvement'],
  },
  {
    id: 'collectibles',
    label: 'Collectibles',
    collectionHandles: ['collectibles-1'],
    tagMatches: ['Collectibles', 'Collectible'],
  },
  {
    id: 'household',
    label: 'Household Items',
    collectionHandles: ['household-items'],
    tagMatches: ['Household'],
  },
  { id: 'kitchenware', label: 'Kitchenware', collectionHandles: ['kitchenware'], tagMatches: ['Kitchenware'] },
  { id: 'kitchenware-dinnerware', label: 'Dinnerware', parentId: 'kitchenware', tagMatches: ['Dinnerware'] },
  {
    id: 'music',
    label: 'Music Instruments',
    collectionHandles: ['musical-instruments'],
    tagMatches: ['Music', 'Instruments'],
  },
  {
    id: 'school-office',
    label: 'School and Office Supplies',
    collectionHandles: ['school-office-supplies'],
    tagMatches: ['School', 'Office Supplies'],
  },
  {
    id: 'school-early-learning',
    label: 'Early Learning Materials',
    parentId: 'school-office',
    tagMatches: ['Early Learning'],
  },
  { id: 'shoes', label: 'Shoes', tagMatches: ['Shoes', 'Footwear'] },
  { id: 'shoes-kids', label: 'Kids', parentId: 'shoes', tagMatches: ['Kids Shoes', 'Kids'] },
  { id: 'sports', label: 'Sports and Exercise', collectionHandles: ['sports'], tagMatches: ['Sports', 'Exercise'] },
  { id: 'technology', label: 'Technology', collectionHandles: ['electronics'], tagMatches: ['Electronics', 'Technology'] },
  {
    id: 'toys',
    label: 'Toys and Games',
    collectionHandles: ['toys-games-1'],
    tagMatches: ['Toys', 'Games', 'Toys & Games'],
  },
  { id: 'toys-board-games', label: 'Board Games', parentId: 'toys', tagMatches: ['Board Game', 'Board Games'] },
  { id: 'toys-plushies', label: 'Plushies', parentId: 'toys', tagMatches: ['Plush', 'Plushies', 'Stuffed'] },
  { id: 'uncategorized', label: 'Uncategorized', special: 'uncategorized' },
  { id: 'recent', label: 'Recently Viewed Items', special: 'recent' },
];
