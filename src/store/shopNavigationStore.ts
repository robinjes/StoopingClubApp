import { create } from 'zustand';

type ShopNavigationStore = {
  pendingCategoryId: string | null;
  requestCategory: (categoryId: string) => void;
  takePendingCategory: () => string | null;
};

export const useShopNavigationStore = create<ShopNavigationStore>((set, get) => ({
  pendingCategoryId: null,
  requestCategory: (categoryId) => set({ pendingCategoryId: categoryId }),
  takePendingCategory: () => {
    const categoryId = get().pendingCategoryId;
    set({ pendingCategoryId: null });
    return categoryId;
  },
}));
