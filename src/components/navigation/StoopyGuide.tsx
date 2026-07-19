import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../feedback/AnimatedPressable';
import { useNavLayout } from '../../context/NavLayoutContext';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import { STOOPY_BAR_HEIGHT, STOOPY_SIZE } from '../../navigation/constants';
import { navigateToShopTab } from '../../navigation/rootNavigation';
import { haptics } from '../../services/feedback/haptics';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const PANEL_WIDTH = 212;
const OPEN_SPRING = { damping: 16, stiffness: 240, mass: 0.7 };
const SHOP_COLOR = '#00553A';
const DONATE_COLOR = '#FF6B7A';

type MenuItem = {
  id: string;
  label: string;
  icon: IoniconName;
  color: string;
  overlay: 'about' | 'involved' | 'contact';
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'about',
    label: 'About Us',
    icon: 'information-circle',
    color: '#1CB0F6',
    overlay: 'about',
  },
  {
    id: 'involved',
    label: 'Get Involved',
    icon: 'people',
    color: '#CE82FF',
    overlay: 'involved',
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: 'mail',
    color: '#3B6D11',
    overlay: 'contact',
  },
];

type MenuRowProps = {
  item: MenuItem;
  index: number;
  open: boolean;
  isLast: boolean;
  onPress: () => void;
};

function MenuRow({ item, index, open, isLast, onPress }: MenuRowProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = open
      ? withDelay(90 + index * 55, withSpring(1, OPEN_SPRING))
      : withTiming(0, { duration: 120, easing: Easing.in(Easing.quad) });
  }, [index, open, progress]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return (
    <Animated.View style={rowStyle}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        style={[
          styles.row,
          !isLast ? { borderBottomWidth: 1, borderBottomColor: colors.border } : null,
        ]}
      >
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: `${item.color}22` }}
        >
          <Ionicons name={item.icon} size={17} color={item.color} />
        </View>
        <Text className="ml-3 flex-1 text-sm font-semibold" style={{ color: colors.text }}>
          {item.label}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

type MenuPanelProps = {
  open: boolean;
  onItemPress: (item: MenuItem) => void;
};

function MenuPanel({ open, onItemPress }: MenuPanelProps) {
  const { colors, isDark } = useTheme();
  const panelProgress = useSharedValue(0);

  useEffect(() => {
    panelProgress.value = open
      ? withSpring(1, OPEN_SPRING)
      : withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) });
  }, [open, panelProgress]);

  const panelStyle = useAnimatedStyle(() => ({
    opacity: panelProgress.value,
    transform: [
      { translateY: (1 - panelProgress.value) * 24 },
      { scale: 0.92 + panelProgress.value * 0.08 },
    ],
  }));

  return (
    <Animated.View pointerEvents={open ? 'auto' : 'none'} style={[styles.panelOuter, panelStyle]}>
      <View
        style={[
          styles.panelWrap,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            shadowOpacity: isDark ? 0.35 : 0.14,
          },
        ]}
      >
        <View
          className="border-b px-3 py-2"
          style={{ borderBottomColor: colors.border, backgroundColor: colors.surfaceMuted }}
        >
          <Text
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: colors.textMuted }}
          >
            Explore
          </Text>
        </View>

        {MENU_ITEMS.map((item, index) => (
          <MenuRow
            key={item.id}
            item={item}
            index={index}
            open={open}
            isLast={index === MENU_ITEMS.length - 1}
            onPress={() => onItemPress(item)}
          />
        ))}
      </View>

      <View
        style={[
          styles.panelTail,
          {
            backgroundColor: colors.background,
            borderLeftColor: colors.border,
            borderBottomColor: colors.border,
          },
        ]}
      />
    </Animated.View>
  );
}

export default function StoopyGuide() {
  const insets = useSafeAreaInsets();
  const { overlay, openOverlay, closeOverlay } = useOverlay();
  const { colors, isDark } = useTheme();
  const { isStoopyNav } = useNavLayout();
  const [menuOpen, setMenuOpen] = useState(false);
  const stoopyScale = useSharedValue(1);
  const stoopyBounce = useSharedValue(0);

  useEffect(() => {
    if (overlay) {
      setMenuOpen(false);
    }
  }, [overlay]);

  useEffect(() => {
    stoopyBounce.value = withDelay(
      400,
      withSpring(1, { damping: 12, stiffness: 180, mass: 0.7 }),
    );
  }, [stoopyBounce]);

  const stoopyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - stoopyBounce.value) * 18 },
      { scale: stoopyScale.value * (0.86 + stoopyBounce.value * 0.14) },
    ],
  }));

  if (!isStoopyNav) {
    return null;
  }

  const isShopActive = !overlay && !menuOpen;
  const isDonateActive = overlay === 'donate';

  function handleShopPress() {
    haptics.selection();
    setMenuOpen(false);
    closeOverlay();
    navigateToShopTab();
  }

  function handleExplorePress() {
    haptics.selection();
    stoopyScale.value = withSpring(1.08, { damping: 12, stiffness: 320 }, () => {
      stoopyScale.value = withSpring(1, { damping: 14, stiffness: 280 });
    });
    setMenuOpen((current) => !current);
  }

  function handleDonatePress() {
    haptics.selection();
    setMenuOpen(false);
    openOverlay('donate');
  }

  function handleItemPress(item: MenuItem) {
    setMenuOpen(false);
    openOverlay(item.overlay);
  }

  return (
    <>
      {menuOpen ? (
        <Pressable
          style={[StyleSheet.absoluteFillObject, styles.backdrop]}
          onPress={() => setMenuOpen(false)}
          accessibilityLabel="Close Explore menu"
        />
      ) : null}

      <View
        pointerEvents="box-none"
        style={[
          styles.barHost,
          {
            paddingBottom: Math.max(insets.bottom, 8),
            backgroundColor: colors.cream,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View pointerEvents="box-none" style={styles.panelAnchor}>
          <MenuPanel open={menuOpen} onItemPress={handleItemPress} />
        </View>

        <View style={styles.barRow}>
          <View style={styles.iconRow}>
            <AnimatedPressable
              haptic={null}
              pressedScale={0.92}
              accessibilityRole="button"
              accessibilityLabel="Shop"
              accessibilityState={{ selected: isShopActive }}
              onPress={handleShopPress}
              style={styles.navTab}
            >
              <Ionicons
                name={isShopActive ? 'bag' : 'bag-outline'}
                size={44}
                color={isShopActive ? SHOP_COLOR : `${SHOP_COLOR}99`}
              />
            </AnimatedPressable>

            <AnimatedPressable
              haptic={null}
              pressedScale={0.94}
              accessibilityRole="button"
              accessibilityLabel="Explore"
              accessibilityState={{ selected: menuOpen }}
              onPress={handleExplorePress}
              style={styles.navTab}
            >
              <Animated.View
                style={[
                  stoopyStyle,
                  {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.35 : 0.18,
                    shadowRadius: 8,
                    elevation: 6,
                  },
                ]}
              >
                <Image
                  source={require('../../../assets/stoopylogo.png')}
                  style={styles.stoopyImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </AnimatedPressable>

            <AnimatedPressable
              haptic={null}
              pressedScale={0.92}
              accessibilityRole="button"
              accessibilityLabel="Donate"
              accessibilityState={{ selected: isDonateActive }}
              onPress={handleDonatePress}
              style={styles.navTab}
            >
              <Ionicons
                name={isDonateActive ? 'gift' : 'gift-outline'}
                size={44}
                color={DONATE_COLOR}
              />
            </AnimatedPressable>
          </View>

          <View style={styles.labelRow} pointerEvents="none">
            <Text
              style={[
                styles.navLabel,
                styles.shopLabel,
                { color: isShopActive ? SHOP_COLOR : `${SHOP_COLOR}99` },
              ]}
            >
              Shop
            </Text>
            <Text
              style={[
                styles.navLabel,
                {
                  color:
                    menuOpen || overlay === 'about' || overlay === 'involved' || overlay === 'contact'
                      ? SHOP_COLOR
                      : colors.textMuted,
                },
              ]}
            >
              Explore
            </Text>
            <Text style={[styles.navLabel, { color: DONATE_COLOR }]}>Donate</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    zIndex: 29,
    backgroundColor: 'rgba(17, 24, 39, 0.22)',
  },
  barHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: STOOPY_BAR_HEIGHT,
  },
  panelAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },
  panelOuter: {
    width: PANEL_WIDTH,
  },
  panelWrap: {
    width: PANEL_WIDTH,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  panelTail: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    left: PANEL_WIDTH / 2 - 6,
    width: 12,
    height: 12,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '-45deg' }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  barRow: {
    height: STOOPY_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  iconRow: {
    flexDirection: 'row',
    width: '100%',
    height: STOOPY_SIZE,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopLabel: {
    transform: [{ translateY: -2.5 }],
  },
  labelRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginTop: 2,
  },
  navLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  stoopyImage: {
    width: STOOPY_SIZE,
    height: STOOPY_SIZE,
  },
});
