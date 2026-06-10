import { useWishlistStore } from '../store/wishlistStore';

export function useWishlist() {
  const productIds = useWishlistStore((state) => state.productIds);
  const toggle = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);

  return { productIds, toggle, isWishlisted };
}
