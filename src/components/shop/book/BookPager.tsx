import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { makeImageFromView } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';

import { useTheme } from '../../../context/ThemeContext';
import {
  BINDING_DARK,
  BOOK_COVER_PADDING,
  BOOK_HORIZONTAL_PADDING,
  BOOK_SPINE_WIDTH,
  COVER_BORDER,
} from './bookConstants';
import BookCurl from './BookCurl';
import { createBookPanGesture } from './BookGesture';
import BookPage from './BookPage';
import type { BookDimensions, BookPagerRenderPage } from './bookTypes';
import { useBookPager } from './useBookPager';

type BookPagerProps<T> = {
  items: T[];
  getImageUrl: (item: T, index: number) => string | null;
  renderPage: BookPagerRenderPage;
};

function BookSpine({ color }: { color: string }) {
  return (
    <View style={styles.bindingColumn}>
      <View style={[styles.coverBackPanel, { backgroundColor: BINDING_DARK }]} />
      <View style={[styles.spine, { backgroundColor: color }]}>
        <View style={styles.spineOuterEdge} />
        <View style={styles.spineRidge} />
        <View style={styles.spineStitch} />
        <View style={styles.spineStitchLower} />
        <View style={styles.spineHighlight} />
      </View>
      <View style={styles.hingeGroove} />
    </View>
  );
}

export default function BookPager<T>({ items, getImageUrl, renderPage }: BookPagerProps<T>) {
  const { width: windowWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const pageRef = useRef<View>(null);
  const [pageSize, setPageSize] = useState<BookDimensions>({ pageWidth: 0, pageHeight: 0 });

  const estimatedPageWidth =
    windowWidth - BOOK_HORIZONTAL_PADDING * 2 - BOOK_SPINE_WIDTH - BOOK_COVER_PADDING * 2 - 14;

  const capturePageSnapshot = useCallback(async () => {
    if (!pageRef.current) {
      return null;
    }

    try {
      return await makeImageFromView(pageRef);
    } catch {
      return null;
    }
  }, []);

  const pager = useBookPager({
    itemCount: items.length,
    getImageUrl: (index) => getImageUrl(items[index], index),
    capturePageSnapshot,
  });

  const pageIndex = useSharedValue(pager.index);
  useEffect(() => {
    pageIndex.value = pager.index;
  }, [pager.index, pageIndex]);

  const gesturePageWidth = pageSize.pageWidth > 0 ? pageSize.pageWidth : estimatedPageWidth;

  const panGesture = createBookPanGesture({
    pageWidth: gesturePageWidth,
    itemCount: items.length,
    pageIndex,
    progress: pager.progress,
    isAnimating: pager.isAnimating,
    dragDirection: pager.dragDirection,
    onPreload: pager.preloadSnapshot,
    onBeginForward: pager.beginForwardSession,
    onBeginBackward: pager.beginBackwardSession,
    onSettle: pager.settleFlip,
    onCancel: pager.cancelFlip,
  });

  if (items.length === 0) {
    return null;
  }

  const showStaticPage = !pager.isInteracting;
  const canRenderFlip = pageSize.pageWidth > 0 && pageSize.pageHeight > 0;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={[styles.bookCover, { borderColor: COVER_BORDER, backgroundColor: BINDING_DARK }]}>
          <BookSpine color={colors.brandDark} />

          <View
            style={styles.pageWell}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              if (width > 0 && height > 0) {
                setPageSize({ pageWidth: width, pageHeight: height });
              }
            }}
          >
            <View style={styles.pageWellOutline} pointerEvents="none" />
            <View style={styles.pageStackMarks} pointerEvents="none">
              <View style={styles.pageStackLine} />
              <View style={[styles.pageStackLine, styles.pageStackLineMid]} />
              <View style={[styles.pageStackLine, styles.pageStackLineFar]} />
            </View>

            {showStaticPage && canRenderFlip ? (
              <View ref={pageRef} style={styles.staticPage} collapsable={false}>
                <BookPage paperColor={colors.cream} borderColor={colors.border}>
                  {renderPage(pager.index)}
                </BookPage>
              </View>
            ) : null}

            {pager.flipSession && pager.isInteracting && canRenderFlip ? (
              <BookCurl
                width={pageSize.pageWidth}
                height={pageSize.pageHeight}
                progress={pager.progress}
                session={pager.flipSession}
                paperColor={colors.cream}
              />
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous page"
              style={styles.tapZoneLeft}
              onPress={pager.tapBackward}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next page"
              style={styles.tapZoneRight}
              onPress={pager.tapForward}
            />
          </View>
        </View>
      </GestureDetector>

      <View style={styles.footer}>
        <Text style={[styles.pageCount, { color: colors.textMuted }]}>
          {pager.index + 1} / {items.length}
        </Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Swipe to turn the page</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: BOOK_HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 4,
    minHeight: 0,
  },
  bookCover: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    borderWidth: 2.5,
    borderRadius: 14,
    padding: BOOK_COVER_PADDING,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 6,
  },
  bindingColumn: {
    width: BOOK_SPINE_WIDTH + 6,
    marginRight: 2,
    alignItems: 'stretch',
    justifyContent: 'center',
    zIndex: 6,
  },
  coverBackPanel: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 8,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    opacity: 0.9,
  },
  spine: {
    flex: 1,
    marginVertical: 8,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COVER_BORDER,
    overflow: 'hidden',
    position: 'relative',
  },
  spineOuterEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  spineRidge: {
    position: 'absolute',
    right: 3,
    top: '18%',
    bottom: '18%',
    width: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  spineStitch: {
    position: 'absolute',
    left: '50%',
    top: '24%',
    width: 2,
    height: 10,
    marginLeft: -1,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  spineStitchLower: {
    position: 'absolute',
    left: '50%',
    top: '58%',
    width: 2,
    height: 10,
    marginLeft: -1,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  spineHighlight: {
    position: 'absolute',
    left: 5,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  hingeGroove: {
    position: 'absolute',
    right: -2,
    top: 10,
    bottom: 10,
    width: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pageWell: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  pageWellOutline: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: 'rgba(31,61,12,0.35)',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 3,
  },
  pageStackMarks: {
    position: 'absolute',
    right: 0,
    top: 14,
    bottom: 14,
    width: 10,
    zIndex: 2,
  },
  pageStackLine: {
    position: 'absolute',
    right: 1,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(31,61,12,0.28)',
  },
  pageStackLineMid: {
    right: 4,
    opacity: 0.65,
  },
  pageStackLineFar: {
    right: 7,
    opacity: 0.35,
  },
  staticPage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    overflow: 'hidden',
  },
  tapZoneLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '22%',
    zIndex: 8,
  },
  tapZoneRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '22%',
    zIndex: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 2,
    gap: 2,
  },
  pageCount: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  hint: {
    fontSize: 11,
  },
});
