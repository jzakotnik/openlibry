/**
 * Audio feedback utilities for user interactions
 * Uses Web Audio API to generate simple tones
 */

export type SoundType = "success" | "error" | "scan" | "warning";

interface SoundConfig {
  frequency: number;
  type: OscillatorType;
  gain: number;
  duration: number;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  success: {
    frequency: 800,
    type: "sine",
    gain: 0.1,
    duration: 0.1,
  },
  error: {
    frequency: 300,
    type: "square",
    gain: 0.1,
    duration: 0.1,
  },
  scan: {
    frequency: 1200,
    type: "sine",
    gain: 0.05,
    duration: 0.1,
  },
  warning: {
    frequency: 500,
    type: "triangle",
    gain: 0.1,
    duration: 0.15,
  },
};

/**
 * Play a feedback sound using the Web Audio API
 * Silently fails if audio is not supported
 *
 * @param type - The type of sound to play
 *
 * @example
 * playSound("success"); // Play success tone after form submission
 * playSound("error");   // Play error tone on validation failure
 * playSound("scan");    // Play scan tone when barcode is scanned
 */
export const playSound = (type: SoundType): void => {
  if (typeof window === "undefined") return;

  const config = SOUND_CONFIGS[type];
  if (!config) return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = config.frequency;
    oscillator.type = config.type;
    gainNode.gain.value = config.gain;

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration);

    // Clean up after sound finishes
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch {
    // Audio not supported, silently ignore
  }
};
