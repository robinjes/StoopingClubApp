import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BINDING_DARK, COVER_BORDER } from './bookConstants';

type BookPageChromeProps = {
  children: ReactNode;
  paperColor: string;
  borderColor: string;
};

/** Physical page chrome — binding edge, fore-edge shadow, and inner frame. */
export default function BookPage({ children, paperColor, borderColor }: BookPageChromeProps) {
  return (
    <View style={[styles.page, { backgroundColor: paperColor, borderColor: COVER_BORDER }]} collapsable={false}>
      <View style={[styles.innerFrame, { borderColor }]} pointerEvents="none" />
      <View style={[styles.bindingEdge, { backgroundColor: BINDING_DARK }]} pointerEvents="none" />
      <View style={styles.foreEdge} pointerEvents="none" />
      <View style={styles.foreEdgeHighlight} pointerEvents="none" />
      <View style={styles.paperTexture} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    overflow: 'hidden',
  },
  innerFrame: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 8,
    bottom: 8,
    borderWidth: 1,
    borderRadius: 4,
    opacity: 0.45,
    zIndex: 2,
  },
  bindingEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    opacity: 0.55,
    zIndex: 1,
  },
  foreEdge: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(31,61,12,0.2)',
    zIndex: 1,
  },
  foreEdgeHighlight: {
    position: 'absolute',
    right: 4,
    top: 10,
    bottom: 10,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
    zIndex: 1,
  },
  paperTexture: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.025)',
    zIndex: 0,
  },
});
