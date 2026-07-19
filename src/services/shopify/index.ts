export {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCartCheckoutDetails,
  updateCartLine,
} from './cart';
export {
  isCustomerAccountConfigured,
  isShopifyConfigured,
  shopifyConfig,
} from './config';
export { shopifyFetch } from './client';
export {
  completeCustomerLogin,
  getCustomerAuthStatus,
  logoutCustomer,
  prepareEmailCodeLoginSession,
} from './customerAuth';
export type {
  CartAttribute,
  CartLine,
  ShopifyCart,
  ShopifyProduct,
  ShopifyProductVariant,
} from './types';
