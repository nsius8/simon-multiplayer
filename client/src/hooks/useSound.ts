import { useState, useCallback, useEffect } from 'react';
import {
  playColorById,
  playColorByColor,
  playSuccessSound as playSoundSuccess,
  playErrorSound as playSoundError,
  playTimerWarningSound as playSoundWarning,
  setMuted,
  getMuted,
  initAudioContext,
} from '../utils/sound';
import { type GameColor } from '../types/game.types';

export function useSound() {
  const [isMuted, setIsMuted] = useState(getMuted);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
  }, [isMuted]);

  const setMutedState = useCallback((muted: boolean) => {
    setIsMuted(muted);
    setMuted(muted);
  }, []);

  const playColorSound = useCallback((colorId: string) => {
    playColorById(colorId);
  }, []);

  const playColor = useCallback((color: GameColor) => {
    playColorByColor(color);
  }, []);

  const playSuccessSound = useCallback(() => {
    playSoundSuccess();
  }, []);

  const playErrorSound = useCallback(() => {
    playSoundError();
  }, []);

  const playTimerWarningSound = useCallback(() => {
    playSoundWarning();
  }, []);

  return {
    muted: isMuted,
    toggleMute,
    setMuted: setMutedState,
    playColorSound,
    playColor,
    playSuccessSound,
    playErrorSound,
    playTimerWarningSound,
  };
}

export default useSound;
