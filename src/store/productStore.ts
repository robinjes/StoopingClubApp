import { create } from 'zustand';

import type { ShopifyProduct } from '../types/shopify';

type ProductStore = {
  products: ShopifyProduct[];
  isLoading: boolean;
  error: string | null;
  setProducts: (products: ShopifyProduct[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  isLoading: false,
  error: null,
  setProducts: (products) => set({ products, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
