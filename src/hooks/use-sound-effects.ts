
import { useEffect, useRef } from 'react';
import { useGameContext } from '@/contexts/GameContext';

interface SoundEffects {
  play: (soundType: SoundType) => void;
}

export enum SoundType {
  CLICK = 'click',
  MERGE = 'merge',
  WIN = 'win',
  LOSE = 'lose',
  ERROR = 'error',
}

const soundUrls = {
  [SoundType.CLICK]: '/sounds/click.mp3',
  [SoundType.MERGE]: '/sounds/merge.mp3',
  [SoundType.WIN]: '/sounds/win.mp3',
  [SoundType.LOSE]: '/sounds/lose.mp3',
  [SoundType.ERROR]: '/sounds/error.mp3',
};

export const useSoundEffects = (): SoundEffects => {
  const { state } = useGameContext();
  const { soundEnabled } = state;
  
  // Using refs to store audio elements so they don't trigger rerenders
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    [SoundType.CLICK]: null,
    [SoundType.MERGE]: null,
    [SoundType.WIN]: null,
    [SoundType.LOSE]: null,
    [SoundType.ERROR]: null,
  });
  
  // Initialize audio elements
  useEffect(() => {
    // Create audio elements
    Object.keys(soundUrls).forEach((type) => {
      const soundType = type as SoundType;
      const audio = new Audio();
      audio.src = soundUrls[soundType];
      audio.preload = 'auto';
      audioRefs.current[soundType] = audio;
    });
    
    // Cleanup function
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);
  
  const play = (soundType: SoundType) => {
    if (!soundEnabled) return;
    
    const audio = audioRefs.current[soundType];
    if (audio) {
      // Reset audio to start
      audio.currentTime = 0;
      audio.play().catch(error => {
        // Often happens due to user interaction requirements by browsers
        console.error('Error playing sound:', error);
      });
    }
  };
  
  return { play };
};
