import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type OverlayScreen = 'cart' | 'donate' | 'contact' | 'account' | 'about' | 'involved';

export type AccountRoute = 'SignInShop' | 'Orders' | 'Profile';

type OverlayContextValue = {
  overlay: OverlayScreen | null;
  accountRoute: AccountRoute;
  openOverlay: (screen: OverlayScreen) => void;
  openAccount: (route: AccountRoute) => void;
  closeOverlay: () => void;
};

import { haptics } from '../services/feedback/haptics';
import { playSound } from '../services/feedback/sounds';

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayScreen | null>(null);
  const [accountRoute, setAccountRoute] = useState<AccountRoute>('SignInShop');

  const openOverlay = useCallback((screen: OverlayScreen) => {
    haptics.light();
    setOverlay(screen);
  }, []);

  const openAccount = useCallback((route: AccountRoute) => {
    haptics.light();
    setAccountRoute(route);
    setOverlay('account');
  }, []);

  const closeOverlay = useCallback(() => {
    haptics.selection();
    setOverlay(null);
  }, []);

  const value = useMemo(
    () => ({ overlay, accountRoute, openOverlay, openAccount, closeOverlay }),
    [overlay, accountRoute, openOverlay, openAccount, closeOverlay],
  );

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlay must be used within an OverlayProvider.');
  }
  return context;
}
