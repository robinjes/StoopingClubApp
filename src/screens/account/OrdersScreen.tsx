import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import {
  normalizeDetectedEmail,
  useWebAccountSession,
} from '../../context/WebAccountSessionContext';
import { CUSTOMER_ORDERS_URL } from '../../services/shopify/customerAuth';

const ACCOUNT_ORIGIN = 'https://account.berkeleystooping.org';
const ACCOUNT_PROFILE_URL = `${ACCOUNT_ORIGIN}/profile`;
const ACCOUNT_LOGOUT_URL = `${ACCOUNT_ORIGIN}/logout`;

/**
 * Detect the signed-in Profile email only — ignore login/code screens so a
 * half-finished sign-in does not stick the wrong email on Delete Account.
 */
const DETECT_ACCOUNT_EMAIL_JS = `
(function() {
  function pageText() {
    return (document.body && document.body.innerText) ? document.body.innerText : '';
  }

  function isAuthScreen(text) {
    return /enter code|sent to|sign in|log in|create account|something went wrong|invalid redirect/i.test(text)
      && !/\\baddresses\\b/i.test(text);
  }

  function pickProfileEmail() {
    var text = pageText();
    if (isAuthScreen(text)) {
      return { type: 'account_signed_out' };
    }

    var nodes = document.querySelectorAll('p, span, div, dt, dd, label, li');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var label = (node.textContent || '').trim();
      if (label !== 'Email') continue;
      var container = node.parentElement;
      if (!container) continue;
      var containerText = (container.innerText || '').replace(/^Email\\s*/i, ' ').trim();
      var match = containerText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i);
      if (match) {
        return { type: 'account_email', email: match[0], source: 'profile_label' };
      }
    }

    var inputs = document.querySelectorAll('input[type="email"], input[name*="email" i]');
    for (var j = 0; j < inputs.length; j++) {
      var input = inputs[j];
      var value = (input.value || '').trim();
      if (!value || value.indexOf('@') < 0) continue;
      if (input.readOnly || input.disabled || input.getAttribute('aria-readonly') === 'true') {
        return { type: 'account_email', email: value, source: 'profile_input' };
      }
    }

    if (/\\baddresses\\b/i.test(text) || /\\bno addresses added\\b/i.test(text) || /\\bcontact\\b/i.test(text)) {
      var bodyMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i);
      if (bodyMatch) {
        return { type: 'account_email', email: bodyMatch[0], source: 'profile_body' };
      }
    }

    return null;
  }

  function report() {
    try {
      var result = pickProfileEmail();
      if (result && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(result));
      }
    } catch (e) {}
  }

  report();
  setTimeout(report, 600);
  setTimeout(report, 1500);
  setTimeout(report, 3000);
  true;
})();
`;

const CLEAR_WEB_STORAGE_JS = `
(function() {
  try {
    try { localStorage.clear(); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
  } catch (e) {}
  true;
})();
`;

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { closeOverlay, openAccount } = useOverlay();
  const {
    webAccountEmail,
    setWebAccountEmail,
    clearWebAccountSession,
    pendingWebSignOut,
    consumeWebSignOut,
    pendingDeleteIntent,
    clearDeleteIntent,
  } = useWebAccountSession();
  const [isLoading, setIsLoading] = useState(true);
  const [webUri, setWebUri] = useState<string>(
    pendingDeleteIntent ? ACCOUNT_PROFILE_URL : CUSTOMER_ORDERS_URL,
  );
  const lastEmailRef = useRef<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const autoOpenedDeleteRef = useRef(false);

  useEffect(() => {
    if (!pendingWebSignOut) {
      return;
    }
    lastEmailRef.current = null;
    autoOpenedDeleteRef.current = false;
    clearWebAccountSession();
    setWebUri(ACCOUNT_LOGOUT_URL);
    consumeWebSignOut();
  }, [pendingWebSignOut, clearWebAccountSession, consumeWebSignOut]);

  useEffect(() => {
    if (pendingDeleteIntent) {
      setWebUri(ACCOUNT_PROFILE_URL);
      autoOpenedDeleteRef.current = false;
    }
  }, [pendingDeleteIntent]);

  useEffect(() => {
    if (!pendingDeleteIntent || !webAccountEmail || autoOpenedDeleteRef.current) {
      return;
    }
    autoOpenedDeleteRef.current = true;
    clearDeleteIntent();
    openAccount('Profile');
  }, [pendingDeleteIntent, webAccountEmail, clearDeleteIntent, openAccount]);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        email?: string;
      };

      if (payload.type === 'account_signed_out') {
        lastEmailRef.current = null;
        clearWebAccountSession();
        return;
      }

      if (payload.type !== 'account_email') {
        return;
      }

      const email = normalizeDetectedEmail(payload.email);
      if (!email) {
        return;
      }

      if (email === lastEmailRef.current) {
        return;
      }

      lastEmailRef.current = email;
      setWebAccountEmail(email);
    } catch {
      // Ignore non-JSON messages from the page.
    }
  }

  function handleNavigation(nav: WebViewNavigation) {
    const url = nav.url.toLowerCase();
    if (
      url.includes('/logout') ||
      url.includes('login') ||
      url.includes('authentication') ||
      url.includes('enter-code') ||
      url.includes('/auth/')
    ) {
      lastEmailRef.current = null;
      clearWebAccountSession();
    }

    if (
      webUri === ACCOUNT_LOGOUT_URL &&
      (url.includes('/logout') ||
        url === `${ACCOUNT_ORIGIN}/` ||
        url.startsWith(`${ACCOUNT_ORIGIN}/?`))
    ) {
      setTimeout(() => {
        setWebUri(CUSTOMER_ORDERS_URL);
      }, 400);
    }
  }

  function continueToDelete() {
    if (!webAccountEmail) {
      return;
    }
    clearDeleteIntent();
    openAccount('Profile');
  }

  return (
    <ScreenLayout showBack onBack={closeOverlay}>
      <View className="flex-1">
        {pendingDeleteIntent ? (
          <View
            className="border-b px-4 py-3"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>
              Delete account
            </Text>
            <Text className="mt-1 text-xs leading-5" style={{ color: colors.textMuted }}>
              {webAccountEmail
                ? `Signed in as ${webAccountEmail}. Continue to confirm deletion.`
                : 'Sign in if needed, stay on the Profile tab so we can read your email, then continue.'}
            </Text>
            {webAccountEmail ? (
              <Pressable
                className="mt-3 items-center self-start rounded-full px-5 py-2.5"
                style={{ backgroundColor: '#DC2626' }}
                onPress={continueToDelete}
              >
                <Text className="text-sm font-semibold text-white">Continue to Delete</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {isLoading ? (
          <View className="absolute inset-0 z-10 items-center justify-center bg-white dark:bg-gray-950">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}
        <WebView
          key={webUri}
          ref={webViewRef}
          source={{ uri: webUri }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => {
            setIsLoading(false);
            webViewRef.current?.injectJavaScript(DETECT_ACCOUNT_EMAIL_JS);
            if (webUri === ACCOUNT_LOGOUT_URL) {
              webViewRef.current?.injectJavaScript(CLEAR_WEB_STORAGE_JS);
            }
          }}
          onNavigationStateChange={handleNavigation}
          injectedJavaScript={DETECT_ACCOUNT_EMAIL_JS}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          originWhitelist={['https://*']}
          style={{ flex: 1, backgroundColor: colors.background }}
        />
      </View>
    </ScreenLayout>
  );
}
