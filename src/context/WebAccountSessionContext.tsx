import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type WebAccountSessionValue = {
  /** Email detected from the embedded Shopify account WebView while signed in. */
  webAccountEmail: string | null;
  setWebAccountEmail: (email: string | null) => void;
  clearWebAccountSession: () => void;
};

const WebAccountSessionContext = createContext<WebAccountSessionValue | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeDetectedEmail(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const email = value.trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : null;
}

export function WebAccountSessionProvider({ children }: { children: ReactNode }) {
  const [webAccountEmail, setWebAccountEmailState] = useState<string | null>(null);

  const setWebAccountEmail = useCallback((email: string | null) => {
    setWebAccountEmailState(normalizeDetectedEmail(email));
  }, []);

  const clearWebAccountSession = useCallback(() => {
    setWebAccountEmailState(null);
  }, []);

  const value = useMemo(
    () => ({
      webAccountEmail,
      setWebAccountEmail,
      clearWebAccountSession,
    }),
    [webAccountEmail, setWebAccountEmail, clearWebAccountSession],
  );

  return (
    <WebAccountSessionContext.Provider value={value}>{children}</WebAccountSessionContext.Provider>
  );
}

export function useWebAccountSession() {
  const context = useContext(WebAccountSessionContext);
  if (!context) {
    throw new Error('useWebAccountSession must be used within a WebAccountSessionProvider.');
  }
  return context;
}
