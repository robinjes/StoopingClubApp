import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import FadeUp from '../../components/home/FadeUp';
import ImpactStatsGrid from '../../components/home/ImpactStatsGrid';
import ReviewCard from '../../components/home/ReviewCard';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import { CUSTOMER_REVIEWS, IMPACT_STATS } from '../../data/homeContent';
import { ORDER_MESSAGE_TEST_ITEMS } from '../../data/orderMessageTemplate';
import type { HomeStackParamList } from '../../navigation/stacks/HomeStack';
import type { TabParamList } from '../../navigation/TabNavigator';
import { sendTestOrderConfirmationMessage } from '../../services/notifications/orderConfirmation';

type HomeNavigation = NativeStackNavigationProp<HomeStackParamList>;
type TabNavigation = BottomTabNavigationProp<TabParamList>;

export default function HomeScreen() {
  const { colors } = useTheme();
  const { openOverlay } = useOverlay();
  const navigation = useNavigation<HomeNavigation>();
  const tabNavigation = useNavigation<TabNavigation>();
  const [animationKey, setAnimationKey] = useState(0);
  const [isTestingOrderMessage, setIsTestingOrderMessage] = useState(false);

  async function handleTestOrderMessage() {
    setIsTestingOrderMessage(true);

    const items = ORDER_MESSAGE_TEST_ITEMS.map((item) => ({
      title: item.title,
      quantity: item.quantity,
    }));
    const orderedAt = new Date().toISOString();

    const result = await sendTestOrderConfirmationMessage();

    navigation.navigate('OrderMessagePreview', { items, orderedAt });

    if (result.ok) {
      Alert.alert('Test scheduled', 'A sample order confirmation will appear in about 1 second.');
    } else {
      Alert.alert('Could not send test', result.message);
    }

    setIsTestingOrderMessage(false);
  }

  useFocusEffect(
    useCallback(() => {
      setAnimationKey((key) => key + 1);
    }, []),
  );

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.cream }}
        contentContainerClassName="px-4 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <FadeUp animationKey={animationKey} delay={80}>
          <View
            className="rounded-3xl px-6 py-8"
            style={{ backgroundColor: colors.brandDark }}
          >
            <View
              className="mb-5 self-center rounded-full px-4 py-1.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
            >
              <Text className="text-[10px] font-semibold tracking-[2px] text-white">
                WORLD&apos;S FIRST FREE STORE
              </Text>
            </View>

            <Text
              className="text-center text-3xl leading-10 text-white"
              style={{ fontFamily: 'Georgia' }}
            >
              Spend Less, Save Earth.
            </Text>

            <Text className="mt-4 text-center text-base leading-6 text-white/85">
              Oakland&apos;s completely free online community store — giving preloved household
              items a second life and keeping them out of landfills.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Browse free items"
              className="mt-7 flex-row items-center justify-center self-center rounded-full px-8 py-3.5"
              style={{ backgroundColor: colors.cream }}
              onPress={() => tabNavigation.navigate('ShopTab')}
            >
              <Text className="text-sm font-semibold" style={{ color: colors.brandDark }}>
                Browse Free Items
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.brandDark}
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>
        </FadeUp>

        <FadeUp animationKey={animationKey} delay={180}>
          <View className="mt-4">
            <ImpactStatsGrid stats={IMPACT_STATS} colors={colors} animationKey={animationKey} />
          </View>
        </FadeUp>

        <FadeUp animationKey={animationKey} delay={280}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View my pickups"
            className="mt-4 items-center rounded-full border px-5 py-3"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
            onPress={() => navigation.navigate('Pickups')}
          >
            <Text className="text-sm font-medium" style={{ color: colors.brand }}>
              My pickups & no-show status
            </Text>
          </Pressable>
        </FadeUp>

        <FadeUp animationKey={animationKey} delay={360}>
          <View
            className="mt-8 rounded-2xl px-4 py-3"
            style={{ backgroundColor: colors.brandDark }}
          >
            <Text
              className="text-center text-lg text-white"
              style={{ fontFamily: 'Georgia' }}
            >
              Customer Reviews
            </Text>
          </View>
        </FadeUp>

        <View className="mt-4">
          {CUSTOMER_REVIEWS.map((review, index) => (
            <FadeUp key={review.id} animationKey={animationKey} delay={420 + index * 80}>
              <ReviewCard review={review} colors={colors} />
            </FadeUp>
          ))}
        </View>

        <FadeUp animationKey={animationKey} delay={700}>
          <View
            className="rounded-3xl border px-6 py-8"
            style={{ borderColor: colors.border, backgroundColor: colors.cardActive }}
          >
            <Text
              className="text-center text-2xl leading-8"
              style={{ fontFamily: 'Georgia', color: colors.text }}
            >
              Have something someone else could love?
            </Text>

            <Text className="mt-3 text-center text-base leading-6" style={{ color: colors.textMuted }}>
              Donate preloved household items and keep them out of landfills. No fees. No hassle.
              Just community.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Donate items"
              className="mt-6 flex-row items-center justify-center self-center rounded-full px-8 py-3.5"
              style={{ backgroundColor: colors.brandDark }}
              onPress={() => openOverlay('donate')}
            >
              <Text className="text-sm font-semibold text-white">Donate Items</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </Pressable>
          </View>
        </FadeUp>

        {__DEV__ ? (
          <View className="mt-6 items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Test order confirmation message"
              className="rounded-full border px-5 py-3"
              style={{ borderColor: colors.border, opacity: isTestingOrderMessage ? 0.6 : 1 }}
              disabled={isTestingOrderMessage}
              onPress={() => void handleTestOrderMessage()}
            >
              {isTestingOrderMessage ? (
                <ActivityIndicator size="small" color={colors.brand} />
              ) : (
                <Text className="text-sm font-medium" style={{ color: colors.textMuted }}>
                  Test order message
                </Text>
              )}
            </Pressable>
            <Text className="mt-2 text-center text-xs" style={{ color: colors.textMuted }}>
              Dev only — preview confirmation message without placing an order
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
}
