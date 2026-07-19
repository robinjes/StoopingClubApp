import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

import { SOUND_ASSETS, type SoundId } from './soundAssets';

const SOUND_VOLUME: Record<SoundId, number> = {
  pop: 0.55,
  swoosh: 0.4,
  paper: 0.35,
  success: 0.5,
  slideOut: 0.38,
  notification: 0.45,
};

class SoundService {
  private players = new Map<SoundId, AudioPlayer>();

  private enabled = true;

  private initialized = false;

  private lastPlayedAt = new Map<SoundId, number>();

  private readonly debounceMs = 70;

  async init() {
    if (this.initialized || Platform.OS === 'web') {
      this.initialized = true;
      return;
    }

    try {
      await setAudioModeAsync({
        playsInSilentMode: false,
        interruptionMode: 'mixWithOthers',
        shouldPlayInBackground: false,
      });

      (Object.keys(SOUND_ASSETS) as SoundId[]).forEach((id) => {
        const player = createAudioPlayer(SOUND_ASSETS[id]);
        player.volume = SOUND_VOLUME[id];
        this.players.set(id, player);
      });

      this.initialized = true;
    } catch {
      this.initialized = true;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  play(id: SoundId) {
    if (!this.enabled || Platform.OS === 'web') {
      return;
    }

    const now = Date.now();
    const last = this.lastPlayedAt.get(id) ?? 0;
    if (now - last < this.debounceMs) {
      return;
    }
    this.lastPlayedAt.set(id, now);

    const player = this.players.get(id);
    if (!player) {
      return;
    }

    try {
      player.seekTo(0);
      player.play();
    } catch {
      // Audio unavailable.
    }
  }
}

export const soundService = new SoundService();

export type { SoundId } from './soundAssets';

export function playSound(id: SoundId) {
  soundService.play(id);
}
