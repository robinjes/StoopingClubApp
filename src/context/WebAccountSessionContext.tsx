import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type WebAccountSessionValue = {
  /** Email detected from the embedded Shopify account Profile page. */
  webAccountEmail: string | null;
  /** When true, Orders WebView should load the Shopify logout URL then clear. */
  pendingWebSignOut: boolean;
  /** User tapped Delete Account before a WebView session email was available. */
  pendingDeleteIntent: boolean;
  setWebAccountEmail: (email: string | null) => void;
  clearWebAccountSession: () => void;
  requestWebSignOut: () => void;
  consumeWebSignOut: () => void;
  beginDeleteIntent: () => void;
  clearDeleteIntent: () => void;
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
  const [pendingWebSignOut, setPendingWebSignOut] = useState(false);
  const [pendingDeleteIntent, setPendingDeleteIntent] = useState(false);

  const setWebAccountEmail = useCallback((email: string | null) => {
    setWebAccountEmailState(normalizeDetectedEmail(email));
  }, []);

  const clearWebAccountSession = useCallback(() => {
    setWebAccountEmailState(null);
  }, []);

  const requestWebSignOut = useCallback(() => {
    setWebAccountEmailState(null);
    setPendingDeleteIntent(false);
    setPendingWebSignOut(true);
  }, []);

  const consumeWebSignOut = useCallback(() => {
    setPendingWebSignOut(false);
  }, []);

  const beginDeleteIntent = useCallback(() => {
    setPendingDeleteIntent(true);
  }, []);

  const clearDeleteIntent = useCallback(() => {
    setPendingDeleteIntent(false);
  }, []);

  const value = useMemo(
    () => ({
      webAccountEmail,
      pendingWebSignOut,
      pendingDeleteIntent,
      setWebAccountEmail,
      clearWebAccountSession,
      requestWebSignOut,
      consumeWebSignOut,
      beginDeleteIntent,
      clearDeleteIntent,
    }),
    [
      webAccountEmail,
      pendingWebSignOut,
      pendingDeleteIntent,
      setWebAccountEmail,
      clearWebAccountSession,
      requestWebSignOut,
      consumeWebSignOut,
      beginDeleteIntent,
      clearDeleteIntent,
    ],
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
