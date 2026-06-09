import { create } from 'zustand';

import type { ShopifyProduct } from '../types/shopify';

type ProductStore = {
  products: ShopifyProduct[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  setProducts: (products: ShopifyProduct[]) => void;
  appendProducts: (products: ShopifyProduct[]) => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingMore: (isLoadingMore: boolean) => void;
  setError: (error: string | null) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  setProducts: (products) => set({ products, error: null }),
  appendProducts: (products) =>
    set((state) => {
      const existingIds = new Set(state.products.map((product) => product.id));
      const newProducts = products.filter((product) => !existingIds.has(product.id));
      return { products: [...state.products, ...newProducts] };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
  setError: (error) => set({ error }),
}));
