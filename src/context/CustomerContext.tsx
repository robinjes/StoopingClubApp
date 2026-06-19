import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { confirmOrderPickup, fetchCustomerProfileAndOrders } from '../api/customerOrders';
import {
  completeCustomerLogin,
  getCustomerAuthStatus,
  getValidCustomerAccessToken,
  logoutCustomer,
} from '../services/shopify/customerAuth';
import type { CustomerAddress, CustomerOrder, CustomerProfile } from '../types/customer';
import { countNoShows, isCheckoutRestricted } from '../utils/noShow';

type CustomerContextValue = {
  isConfigured: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshingOrders: boolean;
  profile: CustomerProfile | null;
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
  noShowCount: number;
  checkoutRestricted: boolean;
  error: string | null;
  finishLogin: (code: string, codeVerifier: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  confirmPickup: (orderId: string) => Promise<void>;
  clearError: () => void;
};

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isConfigured = getCustomerAuthStatus().configured;

  const refreshProfile = useCallback(async () => {
    const accessToken = await getValidCustomerAccessToken();
    if (!accessToken) {
      setProfile(null);
      setIsAuthenticated(false);
      return;
    }

    const ordersResult = await fetchCustomerProfileAndOrders(accessToken);
    setProfile(ordersResult.profile);
    setIsAuthenticated(Boolean(ordersResult.profile?.id));
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!isConfigured) {
      setProfile(null);
      setAddresses([]);
      setOrders([]);
      setIsAuthenticated(false);
      return;
    }

    setIsRefreshingOrders(true);
    setError(null);

    try {
      const accessToken = await getValidCustomerAccessToken();
      if (!accessToken) {
        setProfile(null);
        setAddresses([]);
        setOrders([]);
        setIsAuthenticated(false);
        return;
      }

      const ordersResult = await fetchCustomerProfileAndOrders(accessToken);

      setProfile(ordersResult.profile);
      setAddresses(ordersResult.addresses);
      setOrders(ordersResult.orders);
      setIsAuthenticated(Boolean(ordersResult.profile?.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load your account.';
      setError(message);
      setProfile(null);
      setAddresses([]);
      setOrders([]);
      setIsAuthenticated(false);
    } finally {
      setIsRefreshingOrders(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    async function bootstrap() {
      setIsLoading(true);
      await refreshOrders();
      setIsLoading(false);
    }

    void bootstrap();
  }, [refreshOrders]);

  const finishLogin = useCallback(
    async (code: string, codeVerifier: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await completeCustomerLogin(code, codeVerifier);
        await refreshOrders();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not sign in.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshOrders],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await logoutCustomer();
      setProfile(null);
      setAddresses([]);
      setOrders([]);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmPickup = useCallback(
    async (orderId: string) => {
      setError(null);

      const accessToken = await getValidCustomerAccessToken();
      if (!accessToken) {
        throw new Error('Sign in to confirm pickup.');
      }

      const updatedOrder = await confirmOrderPickup(accessToken, orderId);
      if (!updatedOrder) {
        await refreshOrders();
        return;
      }

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? updatedOrder : order)),
      );
    },
    [refreshOrders],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const noShowCount = useMemo(() => countNoShows(orders), [orders]);
  const checkoutRestricted = useMemo(() => isCheckoutRestricted(orders), [orders]);

  const value = useMemo<CustomerContextValue>(
    () => ({
      isConfigured,
      isAuthenticated,
      isLoading,
      isRefreshingOrders,
      profile,
      addresses,
      orders,
      noShowCount,
      checkoutRestricted,
      error,
      finishLogin,
      logout,
      refreshOrders,
      refreshProfile,
      confirmPickup,
      clearError,
    }),
    [
      isConfigured,
      isAuthenticated,
      isLoading,
      isRefreshingOrders,
      profile,
      addresses,
      orders,
      noShowCount,
      checkoutRestricted,
      error,
      finishLogin,
      logout,
      refreshOrders,
      refreshProfile,
      confirmPickup,
      clearError,
    ],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider.');
  }
  return context;
}
