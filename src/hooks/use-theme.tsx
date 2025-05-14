
import * as React from "react";
import { useGameContext } from "@/contexts/GameContext";

type Theme = "dark" | "light" | "system";

export function useTheme() {
  const { state, dispatch } = useGameContext();
  const [mounted, setMounted] = React.useState(false);
  
  // Update DOM and localStorage when theme changes
  const setTheme = React.useCallback((theme: Theme) => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    dispatch({ type: "SET_THEME", payload: theme });
  }, [dispatch]);

  React.useEffect(() => {
    setMounted(true);
    
    // Apply theme on initial load
    const theme = state.theme as Theme;
    setTheme(theme);
    
    // Listen for system theme changes if using system theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (state.theme === "system") {
        setTheme("system");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [state.theme, setTheme]);

  return {
    theme: state.theme as Theme,
    setTheme,
    mounted,
  };
}
