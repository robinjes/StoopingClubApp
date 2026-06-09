import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { addToCart, createCart } from '../services/shopify';
import type { ShopifyCart } from '../services/shopify';

type CartContextValue = {
  cart: ShopifyCart | null;
  itemCount: number;
  checkoutUrl: string | null;
  isLoading: boolean;
  initializeCart: () => Promise<void>;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initializeCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextCart = cart ?? (await createCart());
      setCart(nextCart);
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const addItem = useCallback(
    async (merchandiseId: string, quantity = 1) => {
      setIsLoading(true);
      try {
        let activeCart = cart;
        if (!activeCart) {
          activeCart = await createCart();
        }
        if (!activeCart) {
          return;
        }

        const updatedCart = await addToCart(activeCart.id, merchandiseId, quantity);
        if (updatedCart) {
          setCart(updatedCart);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cart],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: cart?.totalQuantity ?? 0,
      checkoutUrl: cart?.checkoutUrl ?? null,
      isLoading,
      initializeCart,
      addItem,
    }),
    [cart, isLoading, initializeCart, addItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider.');
  }
  return context;
}
