export const SOUND_ASSETS = {
  pop: require('../../../assets/sounds/pop.wav'),
  swoosh: require('../../../assets/sounds/swoosh.wav'),
  paper: require('../../../assets/sounds/paper.wav'),
  success: require('../../../assets/sounds/success.wav'),
  slideOut: require('../../../assets/sounds/slide-out.wav'),
  notification: require('../../../assets/sounds/notification.wav'),
} as const;

export type SoundId = keyof typeof SOUND_ASSETS;
