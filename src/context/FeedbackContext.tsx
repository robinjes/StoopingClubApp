import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { triggerHaptic, type HapticStyle } from '../services/feedback/haptics';
import { playSound, soundService, type SoundId } from '../services/feedback/sounds';

const SOUNDS_ENABLED_KEY = 'stooping-club-sounds-enabled';

type FeedbackContextValue = {
  soundsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
  toggleSounds: () => void;
  haptic: (style: HapticStyle) => void;
  sound: (id: SoundId) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [soundsEnabled, setSoundsEnabledState] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const saved = await AsyncStorage.getItem(SOUNDS_ENABLED_KEY);
        if (saved !== null) {
          const enabled = saved === 'true';
          setSoundsEnabledState(enabled);
          soundService.setEnabled(enabled);
        }
      } finally {
        await soundService.init();
      }
    })();
  }, []);

  const setSoundsEnabled = useCallback((enabled: boolean) => {
    setSoundsEnabledState(enabled);
    soundService.setEnabled(enabled);
    void AsyncStorage.setItem(SOUNDS_ENABLED_KEY, String(enabled));
  }, []);

  const toggleSounds = useCallback(() => {
    setSoundsEnabled(!soundsEnabled);
  }, [setSoundsEnabled, soundsEnabled]);

  const haptic = useCallback((style: HapticStyle) => {
    triggerHaptic(style);
  }, []);

  const sound = useCallback((id: SoundId) => {
    playSound(id);
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      soundsEnabled,
      setSoundsEnabled,
      toggleSounds,
      haptic,
      sound,
    }),
    [haptic, setSoundsEnabled, sound, soundsEnabled, toggleSounds],
  );

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider.');
  }
  return context;
}
