import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStreak } from '../../hooks/useStreak';
import { triggerHaptic } from '../../services/feedback/haptics';
import { MAX_FREEZES } from '../../store/streakStore';
import {
  getCalendarDays,
  getCurrentRunDates,
  getLocalDateString,
  getMonthLabel,
  toDateKey,
} from '../../utils/streakDates';

type StreakModalProps = {
  visible: boolean;
  onClose: () => void;
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const STREAK_ORANGE = '#FF9600';
const FREEZE_BLUE = '#1CB0F6';
const DUO_GREEN = '#58CC02';

export default function StreakModal({ visible, onClose }: StreakModalProps) {
  const insets = useSafeAreaInsets();
  const {
    currentStreak,
    longestStreak,
    activeDates,
    frozenDates,
    freezesAvailable,
    brokenStreak,
    lastOpenDate,
    restoreStreak,
    dismissBrokenStreak,
    showActiveStreakDemo,
    showBrokenStreakDemo,
    resetStreakDemo,
  } = useStreak();
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState({
    year: today.getFullYear(),
    monthIndex: today.getMonth(),
  });

  // Only highlight days that belong to the current unbroken run.
  const runDates = useMemo(
    () => getCurrentRunDates(lastOpenDate, activeDates, frozenDates),
    [lastOpenDate, activeDates, frozenDates],
  );
  const todayKey = getLocalDateString(today);
  const calendarDays = getCalendarDays(visibleMonth.year, visibleMonth.monthIndex);

  function shiftMonth(delta: number) {
    setVisibleMonth((current) => {
      const next = new Date(current.year, current.monthIndex + delta, 1);
      return {
        year: next.getFullYear(),
        monthIndex: next.getMonth(),
      };
    });
  }

  function handleRestore() {
    void restoreStreak().then((restored) => {
      if (restored) {
        triggerHaptic('success');
      }
    });
  }

  function handleDismissBroken() {
    triggerHaptic('selection');
    void dismissBrokenStreak();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-center px-6" style={{ backgroundColor: 'rgba(17, 24, 39, 0.45)' }}>
        <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Close streak" />

        <View
          className="overflow-hidden rounded-3xl bg-white dark:bg-gray-950"
          style={{
            marginTop: insets.top,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <View className="px-6 pb-2 pt-6">
            <Text className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
              Streak
            </Text>
            <Text className="mt-2 text-center text-base leading-6 text-gray-500 dark:text-gray-400">
              Open the app each day so your streak won&apos;t reset!
            </Text>

            <View className="mt-5 flex-row items-center justify-center">
              <View
                className="flex-row items-center rounded-full px-5 py-2"
                style={{ backgroundColor: '#FFF4E5' }}
              >
                <Ionicons name="flame" size={28} color={STREAK_ORANGE} />
                <Text
                  className="ml-2 text-3xl font-bold"
                  style={{ color: STREAK_ORANGE }}
                >
                  {currentStreak}
                </Text>
              </View>

              <View
                className="ml-3 flex-row items-center rounded-full px-4 py-2"
                style={{ backgroundColor: '#E7F6FE' }}
                accessibilityLabel={`${freezesAvailable} of ${MAX_FREEZES} streak freezes available`}
              >
                <Ionicons name="snow" size={22} color={FREEZE_BLUE} />
                <Text className="ml-1.5 text-xl font-bold" style={{ color: FREEZE_BLUE }}>
                  {freezesAvailable}/{MAX_FREEZES}
                </Text>
              </View>
            </View>

            <Text className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
              Freezes save your streak on missed days. Earn one every 5-day milestone.
            </Text>

            {longestStreak > currentStreak ? (
              <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                Longest streak: {longestStreak} days
              </Text>
            ) : null}
          </View>

          {brokenStreak ? (
            <View
              className="mx-5 mt-3 rounded-2xl border px-4 py-4"
              style={{ borderColor: '#FDE0B8', backgroundColor: '#FFF8ED' }}
            >
              <View className="flex-row items-center">
                <Ionicons name="alert-circle" size={20} color={STREAK_ORANGE} />
                <Text className="ml-2 flex-1 text-sm font-semibold text-gray-800">
                  Your {brokenStreak.length}-day streak broke!
                </Text>
              </View>
              <Text className="mt-1 text-xs leading-5 text-gray-500">
                Restore it within 7 days and pick up right where you left off.
              </Text>
              <View className="mt-3 flex-row">
                <Pressable
                  onPress={handleRestore}
                  className="flex-1 items-center rounded-xl py-2.5"
                  style={{ backgroundColor: STREAK_ORANGE }}
                  accessibilityRole="button"
                  accessibilityLabel={`Restore ${brokenStreak.length} day streak`}
                >
                  <Text className="text-sm font-bold uppercase tracking-wide text-white">
                    Restore streak
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleDismissBroken}
                  className="ml-2 items-center justify-center rounded-xl px-4 py-2.5"
                  style={{ backgroundColor: '#F3F4F6' }}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss broken streak"
                >
                  <Text className="text-sm font-bold text-gray-500">Dismiss</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View className="mx-5 mb-6 mt-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
            <View className="mb-4 flex-row items-center justify-between">
              <Pressable
                onPress={() => shiftMonth(-1)}
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: '#F3F4F6' }}
                accessibilityLabel="Previous month"
              >
                <Ionicons name="chevron-back" size={18} color="#9CA3AF" />
              </Pressable>

              <Text className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-200">
                {getMonthLabel(visibleMonth.year, visibleMonth.monthIndex)}
              </Text>

              <Pressable
                onPress={() => shiftMonth(1)}
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: '#F3F4F6' }}
                accessibilityLabel="Next month"
              >
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </Pressable>
            </View>

            <View className="mb-2 flex-row">
              {WEEKDAY_LABELS.map((label, index) => (
                <View key={`${label}-${index}`} className="flex-1 items-center">
                  <Text className="text-xs font-semibold text-gray-400">{label}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <View key={`empty-${index}`} className="mb-2 h-10 w-[14.28%]" />;
                }

                const dateKey = toDateKey(visibleMonth.year, visibleMonth.monthIndex, day);
                const isActive = runDates.active.has(dateKey);
                const isFrozen = runDates.frozen.has(dateKey);
                const isToday = dateKey === todayKey;

                return (
                  <View key={dateKey} className="mb-2 h-10 w-[14.28%] items-center justify-center">
                    <View
                      className="h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isActive
                          ? STREAK_ORANGE
                          : isFrozen
                            ? FREEZE_BLUE
                            : 'transparent',
                        borderWidth: isToday && !isActive && !isFrozen ? 2 : 0,
                        borderColor:
                          isToday && !isActive && !isFrozen ? STREAK_ORANGE : 'transparent',
                      }}
                    >
                      {isFrozen ? (
                        <Ionicons name="snow" size={16} color="#FFFFFF" />
                      ) : (
                        <Text
                          className="text-sm font-semibold"
                          style={{
                            color: isActive ? '#FFFFFF' : isToday ? STREAK_ORANGE : '#9CA3AF',
                          }}
                        >
                          {day}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {__DEV__ ? (
            <View className="mx-5 mb-4 rounded-xl bg-gray-100 p-3 dark:bg-gray-900">
              <Text className="text-center text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Streak demo
              </Text>
              <View className="mt-2 flex-row gap-2">
                <Pressable
                  onPress={showActiveStreakDemo}
                  className="flex-1 items-center rounded-lg bg-white py-2 dark:bg-gray-800"
                  accessibilityRole="button"
                  accessibilityLabel="Show active streak demo"
                >
                  <Text className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Active streak
                  </Text>
                </Pressable>
                <Pressable
                  onPress={showBrokenStreakDemo}
                  className="flex-1 items-center rounded-lg bg-white py-2 dark:bg-gray-800"
                  accessibilityRole="button"
                  accessibilityLabel="Show broken streak demo"
                >
                  <Text className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Streak broke
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => void resetStreakDemo()}
                  className="items-center justify-center rounded-lg px-2"
                  accessibilityRole="button"
                  accessibilityLabel="Restore your real streak"
                >
                  <Ionicons name="refresh" size={18} color="#6B7280" />
                </Pressable>
              </View>
            </View>
          ) : null}

          <Pressable
            onPress={onClose}
            className="mx-5 mb-6 items-center rounded-2xl py-4"
            style={{ backgroundColor: DUO_GREEN }}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text className="text-base font-bold uppercase tracking-wide text-white">Continue</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
