import { useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import {
  normalizeDetectedEmail,
  useWebAccountSession,
} from '../../context/WebAccountSessionContext';
import { CUSTOMER_ORDERS_URL } from '../../services/shopify/customerAuth';

/**
 * Pulls a signed-in customer email out of the Shopify Customer Account UI so
 * Delete Account can work even when the app only has a WebView session (no
 * Customer Account API OAuth token).
 */
const DETECT_ACCOUNT_EMAIL_JS = `
(function() {
  function pickEmail() {
    var mailto = document.querySelector('a[href^="mailto:"]');
    if (mailto && mailto.href) {
      var fromMailto = decodeURIComponent(mailto.href.replace(/^mailto:/i, '')).split('?')[0];
      if (fromMailto && fromMailto.indexOf('@') > 0) return fromMailto;
    }

    var inputs = document.querySelectorAll('input[type="email"], input[name*="email" i]');
    for (var i = 0; i < inputs.length; i++) {
      var value = (inputs[i].value || '').trim();
      if (value.indexOf('@') > 0) return value;
    }

    var text = (document.body && document.body.innerText) ? document.body.innerText : '';
    var match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i);
    return match ? match[0] : null;
  }

  function report() {
    try {
      var email = pickEmail();
      if (email && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'account_email', email: email }));
      }
    } catch (e) {}
  }

  report();
  setTimeout(report, 800);
  setTimeout(report, 2000);
  true;
})();
`;

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
  const { setWebAccountEmail } = useWebAccountSession();
  const [isLoading, setIsLoading] = useState(true);
  const lastEmailRef = useRef<string | null>(null);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        email?: string;
      };
      if (payload.type !== 'account_email') {
        return;
      }

      const email = normalizeDetectedEmail(payload.email);
      if (!email || email === lastEmailRef.current) {
        return;
      }

      lastEmailRef.current = email;
      setWebAccountEmail(email);
    } catch {
      // Ignore non-JSON messages from the page.
    }
  }

  return (
    <ScreenLayout showBack onBack={closeOverlay}>
      <View className="flex-1">
        {isLoading ? (
          <View className="absolute inset-0 z-10 items-center justify-center bg-white dark:bg-gray-950">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}
        <WebView
          source={{ uri: CUSTOMER_ORDERS_URL }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
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
