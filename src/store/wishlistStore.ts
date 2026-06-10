import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const WISHLIST_KEY = 'wishlist_product_ids';

type WishlistStore = {
  productIds: string[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  productIds: [],
  isHydrated: false,
  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(WISHLIST_KEY);
      const productIds = stored ? (JSON.parse(stored) as string[]) : [];
      set({ productIds, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },
  toggle: async (productId) => {
    const current = get().productIds;
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    set({ productIds: next });
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  },
  isWishlisted: (productId) => get().productIds.includes(productId),
}));
