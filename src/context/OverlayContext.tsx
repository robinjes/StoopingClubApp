import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type OverlayScreen = 'cart' | 'donate' | 'contact';

type OverlayContextValue = {
  overlay: OverlayScreen | null;
  openOverlay: (screen: OverlayScreen) => void;
  closeOverlay: () => void;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayScreen | null>(null);

  const openOverlay = useCallback((screen: OverlayScreen) => {
    setOverlay(screen);
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlay(null);
  }, []);

  const value = useMemo(
    () => ({ overlay, openOverlay, closeOverlay }),
    [overlay, openOverlay, closeOverlay],
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
