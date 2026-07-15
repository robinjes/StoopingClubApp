import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type NavLayoutMode = 'stoopy' | 'tabs';

type NavLayoutContextValue = {
  mode: NavLayoutMode;
  isStoopyNav: boolean;
  isTabNav: boolean;
  toggleNavLayout: () => void;
};

const NavLayoutContext = createContext<NavLayoutContextValue | null>(null);

export function NavLayoutProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<NavLayoutMode>('stoopy');

  const toggleNavLayout = useCallback(() => {
    setMode((current) => (current === 'stoopy' ? 'tabs' : 'stoopy'));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isStoopyNav: mode === 'stoopy',
      isTabNav: mode === 'tabs',
      toggleNavLayout,
    }),
    [mode, toggleNavLayout],
  );

  return <NavLayoutContext.Provider value={value}>{children}</NavLayoutContext.Provider>;
}

export function useNavLayout(): NavLayoutContextValue {
  const context = useContext(NavLayoutContext);
  if (!context) {
    throw new Error('useNavLayout must be used within NavLayoutProvider.');
  }
  return context;
}
