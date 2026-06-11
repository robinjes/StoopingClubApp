import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { BRANCH_DIRECTOR_APPLICATION_EMBED_URL } from '../../data/getInvolvedContent';
import { useTheme } from '../../context/ThemeContext';

export default function BranchDirectorApplicationScreen() {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ScreenLayout showBack>
      <View className="flex-1" style={{ backgroundColor: colors.cream }}>
        <View className="px-4 pb-4 pt-6">
          <Text
            className="text-3xl leading-10"
            style={{ fontFamily: 'Georgia', color: colors.brandDark }}
          >
            Branch Director Application
          </Text>
        </View>

        <View className="flex-1">
          {isLoading ? (
            <View className="absolute inset-0 z-10 items-center justify-center">
              <ActivityIndicator size="large" color={colors.brand} />
            </View>
          ) : null}

          <WebView
            source={{ uri: BRANCH_DIRECTOR_APPLICATION_EMBED_URL }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['https://*']}
            style={{ flex: 1, backgroundColor: colors.background }}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}
