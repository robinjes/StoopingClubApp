import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import {
  addDaysToDateString,
  daysBetweenDateStrings,
  getDatesBetween,
  getLocalDateString,
} from '../utils/streakDates';

const STREAK_STORAGE_KEY = 'app_open_streak_v2';
const LEGACY_STREAK_STORAGE_KEY = 'app_open_streak_v1';
const MAX_ACTIVE_DATES = 400;

export const MAX_FREEZES = 2;
/** A new freeze is earned every time the streak hits a multiple of this. */
export const FREEZE_EARN_INTERVAL = 5;
/** Days after a break during which the old streak can still be restored. */
export const RESTORE_WINDOW_DAYS = 7;

export type BrokenStreak = {
  length: number;
  /** Last day the streak was alive. */
  lastActiveDate: string;
  /** Day the break was detected. */
  brokenOnDate: string;
};

export type StreakOpenEvent = 'none' | 'started' | 'extended' | 'freezeUsed' | 'broken';

export type StreakState = {
  currentStreak: number;
  longestStreak: number;
  lastOpenDate: string | null;
  /** Days the app was actually opened. */
  activeDates: string[];
  /** Missed days that were covered by a streak freeze. */
  frozenDates: string[];
  freezesAvailable: number;
  brokenStreak: BrokenStreak | null;
};

type StreakStore = StreakState & {
  isHydrated: boolean;
  isDemo: boolean;
  hydrate: () => Promise<void>;
  recordAppOpen: () => Promise<StreakOpenEvent>;
  restoreStreak: () => Promise<boolean>;
  dismissBrokenStreak: () => Promise<void>;
  showActiveStreakDemo: () => void;
  showBrokenStreakDemo: () => void;
  resetStreakDemo: () => Promise<void>;
};

const EMPTY_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastOpenDate: null,
  activeDates: [],
  frozenDates: [],
  freezesAvailable: 1,
  brokenStreak: null,
};

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function normalizeStreakState(value: unknown): StreakState {
  if (!value || typeof value !== 'object') {
    return EMPTY_STREAK;
  }

  const candidate = value as Partial<StreakState>;
  const broken = candidate.brokenStreak;
  const brokenStreak =
    broken &&
    typeof broken === 'object' &&
    typeof broken.length === 'number' &&
    typeof broken.lastActiveDate === 'string' &&
    typeof broken.brokenOnDate === 'string'
      ? { length: broken.length, lastActiveDate: broken.lastActiveDate, brokenOnDate: broken.brokenOnDate }
      : null;

  return {
    currentStreak: typeof candidate.currentStreak === 'number' ? candidate.currentStreak : 0,
    longestStreak: typeof candidate.longestStreak === 'number' ? candidate.longestStreak : 0,
    lastOpenDate: typeof candidate.lastOpenDate === 'string' ? candidate.lastOpenDate : null,
    activeDates: normalizeStringArray(candidate.activeDates),
    frozenDates: normalizeStringArray(candidate.frozenDates),
    freezesAvailable:
      typeof candidate.freezesAvailable === 'number'
        ? Math.min(Math.max(candidate.freezesAvailable, 0), MAX_FREEZES)
        : EMPTY_STREAK.freezesAvailable,
    brokenStreak,
  };
}

async function persistStreak(state: StreakState): Promise<void> {
  await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(state));
}

function isRestoreExpired(brokenStreak: BrokenStreak, today: string): boolean {
  return daysBetweenDateStrings(brokenStreak.brokenOnDate, today) > RESTORE_WINDOW_DAYS;
}

function earnedFreeze(previousStreak: number, nextStreak: number): boolean {
  return (
    nextStreak > previousStreak &&
    nextStreak > 0 &&
    nextStreak % FREEZE_EARN_INTERVAL === 0
  );
}

export const useStreakStore = create<StreakStore>((set, get) => ({
  ...EMPTY_STREAK,
  isHydrated: false,
  isDemo: false,

  hydrate: async () => {
    try {
      const stored =
        (await AsyncStorage.getItem(STREAK_STORAGE_KEY)) ??
        (await AsyncStorage.getItem(LEGACY_STREAK_STORAGE_KEY));
      if (stored) {
        set({ ...normalizeStreakState(JSON.parse(stored)), isHydrated: true, isDemo: false });
        return;
      }
    } catch {
      // Fall through to empty state.
    }

    set({ ...EMPTY_STREAK, isHydrated: true, isDemo: false });
  },

  recordAppOpen: async () => {
    const state = get();
    if (state.isDemo) {
      return 'none';
    }

    const today = getLocalDateString();

    if (state.lastOpenDate === today) {
      return 'none';
    }

    const gap = state.lastOpenDate
      ? daysBetweenDateStrings(state.lastOpenDate, today)
      : null;

    let event: StreakOpenEvent = 'started';
    let currentStreak = 1;
    let freezesAvailable = state.freezesAvailable;
    let frozenDates = state.frozenDates;
    let brokenStreak = state.brokenStreak;

    if (gap !== null && gap <= 0) {
      // Device clock moved backwards; keep the streak as-is.
      event = 'none';
      currentStreak = state.currentStreak;
    } else if (gap === 1) {
      event = 'extended';
      currentStreak = state.currentStreak + 1;
    } else if (gap !== null && gap > 1) {
      const missedDates = getDatesBetween(state.lastOpenDate as string, today);

      if (missedDates.length <= freezesAvailable && state.currentStreak > 0) {
        // Freezes automatically cover the missed days; the streak survives.
        event = 'freezeUsed';
        freezesAvailable -= missedDates.length;
        frozenDates = [...missedDates, ...frozenDates].slice(0, MAX_ACTIVE_DATES);
        currentStreak = state.currentStreak + 1;
      } else if (state.currentStreak > 0) {
        event = 'broken';
        brokenStreak = {
          length: state.currentStreak,
          lastActiveDate: state.lastOpenDate as string,
          brokenOnDate: today,
        };
      }
    }

    if (earnedFreeze(state.currentStreak, currentStreak)) {
      freezesAvailable = Math.min(freezesAvailable + 1, MAX_FREEZES);
    }

    if (brokenStreak && isRestoreExpired(brokenStreak, today)) {
      brokenStreak = null;
    }

    const activeDates = state.activeDates.includes(today)
      ? state.activeDates
      : [today, ...state.activeDates].slice(0, MAX_ACTIVE_DATES);

    const nextState: StreakState = {
      currentStreak,
      longestStreak: Math.max(state.longestStreak, currentStreak),
      lastOpenDate: today,
      activeDates,
      frozenDates,
      freezesAvailable,
      brokenStreak,
    };

    set(nextState);
    await persistStreak(nextState);
    return event;
  },

  restoreStreak: async () => {
    const state = get();
    const today = getLocalDateString();

    if (!state.brokenStreak || isRestoreExpired(state.brokenStreak, today)) {
      return false;
    }

    // Bridge the missed days so the run reads as continuous on the calendar.
    const gapDates = getDatesBetween(
      state.brokenStreak.lastActiveDate,
      state.lastOpenDate ?? today,
    ).filter((date) => !state.activeDates.includes(date));

    const currentStreak = state.brokenStreak.length + Math.max(state.currentStreak, 1);

    const nextState: StreakState = {
      ...state,
      currentStreak,
      longestStreak: Math.max(state.longestStreak, currentStreak),
      frozenDates: [...gapDates, ...state.frozenDates].slice(0, MAX_ACTIVE_DATES),
      brokenStreak: null,
    };

    set({ ...nextState, isDemo: state.isDemo });
    if (!state.isDemo) {
      await persistStreak(nextState);
    }
    return true;
  },

  dismissBrokenStreak: async () => {
    const state = get();
    if (!state.brokenStreak) {
      return;
    }

    const nextState: StreakState = { ...state, brokenStreak: null };
    set({ ...nextState, isDemo: state.isDemo });
    if (!state.isDemo) {
      await persistStreak(nextState);
    }
  },

  showActiveStreakDemo: () => {
    const today = getLocalDateString();
    const frozenDate = addDaysToDateString(today, -3);
    const activeDates = [0, -1, -2, -4, -5, -6]
      .map((offset) => addDaysToDateString(today, offset));

    set({
      currentStreak: 7,
      longestStreak: 12,
      lastOpenDate: today,
      activeDates,
      frozenDates: [frozenDate],
      freezesAvailable: 1,
      brokenStreak: null,
      isDemo: true,
    });
  },

  showBrokenStreakDemo: () => {
    const today = getLocalDateString();
    const lastActiveDate = addDaysToDateString(today, -2);
    const activeDates = [0, -2, -3, -4, -5, -6, -7, -8]
      .map((offset) => addDaysToDateString(today, offset));

    set({
      currentStreak: 1,
      longestStreak: 7,
      lastOpenDate: today,
      activeDates,
      frozenDates: [],
      freezesAvailable: 0,
      brokenStreak: {
        length: 7,
        lastActiveDate,
        brokenOnDate: today,
      },
      isDemo: true,
    });
  },

  resetStreakDemo: async () => {
    await get().hydrate();
  },
}));
