import { create } from 'zustand';

type RetailValueStore = {
  byHandle: Record<string, number>;
  setRetailValue: (handle: string, amount: number) => void;
};

export const useRetailValueStore = create<RetailValueStore>((set) => ({
  byHandle: {},
  setRetailValue: (handle, amount) =>
    set((state) => ({
      byHandle: { ...state.byHandle, [handle]: amount },
    })),
}));
