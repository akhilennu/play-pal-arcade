import { useEffect, useCallback, useRef } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler>;

interface UseKeyboardControlsOptions {
  gameActive: boolean;
  keyMap: KeyMap;
  preventDefault?: boolean;
}

export function useKeyboardControls({ 
  gameActive, 
  keyMap,
  preventDefault = true 
}: UseKeyboardControlsOptions) {
  // Use a ref to keep track of the current key map
  const keyMapRef = useRef<KeyMap>(keyMap);
  
  // Update ref if keyMap changes
  useEffect(() => {
    keyMapRef.current = keyMap;
  }, [keyMap]);
  
  // The event handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only process if game is active
    if (!gameActive) return;
    
    const handler = keyMapRef.current[e.key];
    
    if (handler) {
      if (preventDefault) {
        e.preventDefault();
      }
      handler(e);
    }
  }, [gameActive, preventDefault]);
  
  // Set up and clean up event listeners
  useEffect(() => {
    if (gameActive) {
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [gameActive, handleKeyDown]);
}
