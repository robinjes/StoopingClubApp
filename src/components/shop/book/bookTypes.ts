import type { ReactNode } from 'react';
import type { SkImage } from '@shopify/react-native-skia';

export type BookFlipDirection = 'forward' | 'backward';

/**
 * Frozen snapshot for a single flip gesture/animation.
 * Page bitmaps are captured from the live RN view so the product image
 * stays glued to the paper during the curl.
 */
export type BookFlipSession = {
  direction: BookFlipDirection;
  turningIndex: number;
  revealIndex: number;
  turningImageUrl: string | null;
  revealImageUrl: string | null;
  /** Full-page bitmap of the sheet being turned (image + text together). */
  turningPageSnapshot: SkImage | null;
  /** Full-page bitmap of the sheet revealed underneath (backward flips). */
  revealPageSnapshot: SkImage | null;
};

export type BookPagerRenderPage = (index: number) => ReactNode;

export type BookDimensions = {
  pageWidth: number;
  pageHeight: number;
};
