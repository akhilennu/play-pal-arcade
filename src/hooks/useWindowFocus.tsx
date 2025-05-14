
import { useState, useEffect } from 'react';

interface UseWindowFocusOptions {
  onFocus?: () => void;
  onBlur?: () => void;
}

export function useWindowFocus(options: UseWindowFocusOptions = {}) {
  const [isFocused, setIsFocused] = useState<boolean>(document.hasFocus());
  
  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
      if (options.onFocus) options.onFocus();
    };
    
    const handleBlur = () => {
      setIsFocused(false);
      if (options.onBlur) options.onBlur();
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [options]);
  
  return isFocused;
}
