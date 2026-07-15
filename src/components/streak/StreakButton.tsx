import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useStreak } from '../../hooks/useStreak';
import StreakModal from './StreakModal';

const STREAK_ORANGE = '#FF9600';

type StreakButtonProps = {
  light?: boolean;
};

export default function StreakButton({ light = false }: StreakButtonProps) {
  const { currentStreak, brokenStreak } = useStreak();
  const [modalVisible, setModalVisible] = useState(false);
  const displayCount = Math.max(currentStreak, 0);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          brokenStreak
            ? `Streak broken. ${displayCount} day streak. Open streak calendar to restore.`
            : `${displayCount} day streak. Open streak calendar.`
        }
        onPress={() => setModalVisible(true)}
        className="flex-row items-center rounded-xl px-2 py-1"
        style={{ backgroundColor: light ? 'rgba(255, 255, 255, 0.18)' : '#FFF4E5' }}
      >
        <Ionicons name="flame" size={22} color={brokenStreak ? '#9CA3AF' : STREAK_ORANGE} />
        <Text
          className="ml-1 text-lg font-bold"
          style={{ color: light ? '#FFFFFF' : STREAK_ORANGE }}
        >
          {displayCount}
        </Text>
        <View className="ml-0.5">
          <Ionicons
            name="caret-down"
            size={12}
            color={light ? '#FFFFFF' : STREAK_ORANGE}
          />
        </View>
      </Pressable>

      <StreakModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}
