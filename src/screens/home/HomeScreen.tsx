import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import CountUpNumber from '../../components/home/CountUpNumber';
import FadeUp from '../../components/home/FadeUp';
import ScreenLayout from '../../components/layout/ScreenLayout';
import type { TabParamList } from '../../navigation/TabNavigator';
import { colors } from '../../theme/colors';

type TabNavigation = BottomTabNavigationProp<TabParamList>;

const IMPACT_STATS = [
  { target: 8500, suffix: '+', label: 'Preloved Items Diverted From Landfill' },
  { target: 2300, suffix: '+', label: 'Orders Fulfilled' },
  { target: 47, suffix: '', label: 'Tons of CO2 Emissions Prevented' },
  { target: 19, suffix: '', label: 'Global Partnerships' },
] as const;

export default function HomeScreen() {
  const navigation = useNavigation<TabNavigation>();
  const { width } = useWindowDimensions();
  const heroHeight = Math.max(300, width * 0.58);
  const [animationKey, setAnimationKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setAnimationKey((key) => key + 1);
    }, []),
  );

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require('../../../assets/banner.png')}
          style={{ width, height: heroHeight }}
          resizeMode="cover"
          accessibilityLabel="Stooping Club Oakland forest banner"
        >
          <View className="flex-1 items-center justify-center px-6">
            <FadeUp animationKey={animationKey} delay={100}>
              <Text className="text-center text-3xl font-bold text-white">
                Stooping Club Oakland
              </Text>
            </FadeUp>

            <FadeUp animationKey={animationKey} delay={300}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Shop now"
                className="mt-6 rounded-full px-10 py-3.5"
                style={{ backgroundColor: colors.brand }}
                onPress={() => navigation.navigate('ShopTab')}
              >
                <Text className="text-sm font-bold tracking-widest text-white">SHOP NOW</Text>
              </Pressable>
            </FadeUp>
          </View>
        </ImageBackground>

        <View className="items-center px-6 pb-4 pt-10">
          <FadeUp animationKey={animationKey} delay={450}>
            <Text
              className="text-center text-2xl"
              style={{ fontFamily: 'Georgia', color: colors.brand }}
            >
              Our Impact at a Glance
            </Text>
          </FadeUp>

          <View className="mt-8 w-full flex-row flex-wrap">
            {IMPACT_STATS.map((stat, index) => (
              <View key={stat.label} className="w-1/2 items-center px-3 py-5">
                <CountUpNumber
                  target={stat.target}
                  suffix={stat.suffix}
                  animationKey={animationKey}
                  delay={600 + index * 120}
                  className="text-3xl font-bold"
                  style={{ color: colors.brand }}
                />
                <Text className="mt-2 text-center text-sm leading-5 text-gray-900">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
