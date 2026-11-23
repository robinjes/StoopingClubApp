/**
 * Hides Shopify's "Continue with Shop" button (and the "or" divider under it)
 * on the hosted sign-in page, and the storefront theme's "Sign in with Shop"
 * button, inside the app. App Review guideline 4.8 rejects
 * third-party sign-in without an equivalent privacy-preserving option, so the
 * app offers email one-time-code sign-in only. The website keeps Sign in with Shop.
 *
 * Shopify renders these as <shop-login> and <shop-login-button> elements; if
 * they change that, the button reappears in the app, so check the sign-in page
 * before each release.
 */
export const HIDE_SHOP_LOGIN_JS = `
(function() {
  if (document.getElementById('stooping-hide-shop-login')) return;
  var style = document.createElement('style');
  style.id = 'stooping-hide-shop-login';
  style.textContent =
    'shop-login, div:has(> shop-login), div:has(> span[role="separator"]),' +
    ' shop-login-button, account-login-actions { display: none !important; }';
  (document.head || document.documentElement).appendChild(style);
})();
true;
`;
