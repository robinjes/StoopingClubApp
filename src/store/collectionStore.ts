import { create } from 'zustand';

import type { ShopifyCollection } from '../types/shopify';

type CollectionStore = {
  collections: ShopifyCollection[];
  isLoading: boolean;
  error: string | null;
  setCollections: (collections: ShopifyCollection[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useCollectionStore = create<CollectionStore>((set) => ({
  collections: [],
  isLoading: false,
  error: null,
  setCollections: (collections) => set({ collections, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
