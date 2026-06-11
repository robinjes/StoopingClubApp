import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { ACCEPTED_DONATION_ITEMS, DONATION_FORM_URL } from '../../data/donationItems';
import { useTheme } from '../../context/ThemeContext';

export default function DonateScreen() {
  const { colors } = useTheme();
  async function openDonationForm() {
    await WebBrowser.openBrowserAsync(DONATION_FORM_URL);
  }

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1 bg-white dark:bg-gray-950"
        contentContainerClassName="px-6 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-center text-2xl leading-8 text-gray-900 dark:text-gray-100"
          style={{ fontFamily: 'Georgia' }}
        >
          Make a Difference With Your Donations at Oakland Stooping
        </Text>

        <Text className="mt-5 text-base leading-6 text-gray-600 dark:text-gray-400">
          Thank you for your interest in donating to Oakland Stooping. As a student-led
          organization, we reserve the right to decline anything that&apos;s inappropriate,
          unsafe, or excessively worn. Our capacity is limited, and we prioritize quality over
          quantity to ensure donations are truly usable. If you&apos;re unsure whether something
          is a fit, you&apos;re welcome to reach out.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open donation form"
          className="mt-8 self-center rounded-full px-10 py-3.5"
          style={{ backgroundColor: colors.brand }}
          onPress={() => void openDonationForm()}
        >
          <Text className="text-sm font-bold tracking-widest text-white">DONATION FORM</Text>
        </Pressable>

        <Text className="mt-10 text-base leading-6 text-gray-600 dark:text-gray-400">
          We accept a wide range of clean, functional items, including the following:
        </Text>

        <View className="mt-5 flex-row flex-wrap">
          {ACCEPTED_DONATION_ITEMS.map((item) => (
            <View key={item} className="mb-3 w-1/2 flex-row items-start gap-2 pr-2">
              <Text className="text-base" style={{ color: colors.brand }}>
                •
              </Text>
              <Text className="flex-1 text-sm leading-5 text-gray-800 dark:text-gray-200">{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
