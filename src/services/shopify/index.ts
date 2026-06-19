export {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
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
export { getProducts } from './products';
export type {
  CartLine,
  ShopifyCart,
  ShopifyProduct,
  ShopifyProductVariant,
} from './types';
