export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  accessories: 'Bags, jewelry & small finds',
  art: 'Paintings, prints & wall art',
  'baby-products': 'Gear for little ones',
  'bags-storage': 'Totes, bins & organizers',
  'bathroom-shower': 'Towels, caddies & bath items',
  books: 'Fiction, nonfiction & more',
  costumes: 'Dress-up & seasonal outfits',
  dvds: 'Movies & media',
  furniture: 'Chairs, tables, shelves & more',
  'gift-wrapping': 'Paper, ribbons & supplies',
  health: 'Beauty & self-care',
  'holiday-decor': 'Seasonal decorations',
  'home-decor': 'Frames, vases & accents',
  household: 'Everyday home essentials',
  kitchenware: 'Pots, pans, dishes & utensils',
  music: 'Instruments & accessories',
  'school-office': 'Supplies for study & work',
  shoes: 'Footwear for all ages',
  sports: 'Gear for staying active',
  technology: 'Electronics & gadgets',
  toys: 'Games, plushies & playtime',
  uncategorized: 'Items without a category tag',
  recent: 'Items you viewed recently',
};

export function getCategoryDescription(categoryId: string, label: string): string {
  return CATEGORY_DESCRIPTIONS[categoryId] ?? `Browse ${label.toLowerCase()}`;
}
