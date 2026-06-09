import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCartLine,
} from '../services/shopify';
import type { ShopifyCart } from '../services/shopify';

const CART_ID_KEY = 'shopify_cart_id';

type CartContextValue = {
  cart: ShopifyCart | null;
  itemCount: number;
  checkoutUrl: string | null;
  isLoading: boolean;
  error: string | null;
  initializeCart: () => Promise<void>;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearError: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

async function persistCartId(cartId: string | null): Promise<void> {
  if (cartId) {
    await AsyncStorage.setItem(CART_ID_KEY, cartId);
    return;
  }

  await AsyncStorage.removeItem(CART_ID_KEY);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyCart = useCallback(async (nextCart: ShopifyCart | null) => {
    setCart(nextCart);
    await persistCartId(nextCart?.id ?? null);
  }, []);

  const restoreCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const savedCartId = await AsyncStorage.getItem(CART_ID_KEY);

      if (savedCartId) {
        const existingCart = await getCart(savedCartId);
        if (existingCart) {
          setCart(existingCart);
          return;
        }

        await persistCartId(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore cart.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreCart();
  }, [restoreCart]);

  const initializeCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextCart = cart ?? (await createCart());
      if (nextCart) {
        await applyCart(nextCart);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize cart.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [applyCart, cart]);

  const addItem = useCallback(
    async (merchandiseId: string, quantity = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        let activeCart = cart;
        if (!activeCart) {
          activeCart = await createCart();
        }
        if (!activeCart) {
          throw new Error('Could not create a cart.');
        }

        const updatedCart = await addToCart(activeCart.id, merchandiseId, quantity);
        if (!updatedCart) {
          throw new Error('Could not add item to cart.');
        }

        await applyCart(updatedCart);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add item.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applyCart, cart],
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedCart = await updateCartLine(cart.id, lineId, quantity);
        if (updatedCart) {
          await applyCart(updatedCart);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update item.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [applyCart, cart],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedCart = await removeFromCart(cart.id, [lineId]);
        if (updatedCart) {
          await applyCart(updatedCart);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove item.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [applyCart, cart],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: cart?.totalQuantity ?? 0,
      checkoutUrl: cart?.checkoutUrl ?? null,
      isLoading,
      error,
      initializeCart,
      addItem,
      updateItem,
      removeItem,
      clearError,
    }),
    [cart, isLoading, error, initializeCart, addItem, updateItem, removeItem, clearError],
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
