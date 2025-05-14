
import React, { createContext, useContext, useState, useEffect, useReducer } from "react";
import { useToast } from "@/components/ui/use-toast";
import { GameDifficulty, UserProfile, Score, Achievement } from "@/types";

// Define initial state
interface GameState {
  currentGame: string | null;
  gameSettings: {
    difficulty: GameDifficulty;
    isMultiplayer: boolean;
  };
  profiles: UserProfile[];
  activeProfileId: string | null;
  scores: Score[];
  achievements: Achievement[];
  soundEnabled: boolean;
  musicEnabled: boolean;
  theme: "light" | "dark" | "system";
}

const initialState: GameState = {
  currentGame: null,
  gameSettings: {
    difficulty: GameDifficulty.MEDIUM,
    isMultiplayer: false,
  },
  profiles: [],
  activeProfileId: null,
  scores: [],
  achievements: [],
  soundEnabled: true,
  musicEnabled: true,
  theme: "system",
};

// Define actions
type GameAction =
  | { type: "SET_CURRENT_GAME"; payload: string | null }
  | { type: "SET_DIFFICULTY"; payload: GameDifficulty }
  | { type: "SET_MULTIPLAYER"; payload: boolean }
  | { type: "ADD_PROFILE"; payload: UserProfile }
  | { type: "SET_ACTIVE_PROFILE"; payload: string }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> & { id: string } }
  | { type: "ADD_SCORE"; payload: Score }
  | { type: "UNLOCK_ACHIEVEMENT"; payload: { profileId: string; achievementId: string } }
  | { type: "TOGGLE_SOUND"; payload: boolean }
  | { type: "TOGGLE_MUSIC"; payload: boolean }
  | { type: "SET_THEME"; payload: "light" | "dark" | "system" };

// Create reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SET_CURRENT_GAME":
      return { ...state, currentGame: action.payload };
    case "SET_DIFFICULTY":
      return {
        ...state,
        gameSettings: { ...state.gameSettings, difficulty: action.payload },
      };
    case "SET_MULTIPLAYER":
      return {
        ...state,
        gameSettings: { ...state.gameSettings, isMultiplayer: action.payload },
      };
    case "ADD_PROFILE":
      return { ...state, profiles: [...state.profiles, action.payload] };
    case "SET_ACTIVE_PROFILE":
      return { ...state, activeProfileId: action.payload };
    case "UPDATE_PROFILE":
      return {
        ...state,
        profiles: state.profiles.map((profile) =>
          profile.id === action.payload.id
            ? { ...profile, ...action.payload }
            : profile
        ),
      };
    case "ADD_SCORE":
      return { ...state, scores: [...state.scores, action.payload] };
    case "UNLOCK_ACHIEVEMENT":
      const { profileId, achievementId } = action.payload;
      return {
        ...state,
        profiles: state.profiles.map((profile) =>
          profile.id === profileId
            ? {
                ...profile,
                achievements: profile.achievements.map((achievement) =>
                  achievement.id === achievementId
                    ? { ...achievement, unlockedAt: new Date() }
                    : achievement
                ),
              }
            : profile
        ),
      };
    case "TOGGLE_SOUND":
      return { ...state, soundEnabled: action.payload };
    case "TOGGLE_MUSIC":
      return { ...state, musicEnabled: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    default:
      return state;
  }
};

// Create context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Create provider
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { toast } = useToast();

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("gameAppState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Convert date strings back to Date objects
        if (parsedState.profiles) {
          parsedState.profiles = parsedState.profiles.map((profile: any) => ({
            ...profile,
            createdAt: new Date(profile.createdAt),
            achievements: profile.achievements.map((a: any) => ({
              ...a,
              unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
            })),
          }));
        }
        if (parsedState.scores) {
          parsedState.scores = parsedState.scores.map((score: any) => ({
            ...score,
            date: new Date(score.date),
          }));
        }
        
        // Apply saved state
        Object.keys(parsedState).forEach((key) => {
          dispatch({ 
            // @ts-ignore - This is a dynamic dispatch based on the saved state
            type: `SET_${key.toUpperCase()}`, 
            payload: parsedState[key] 
          });
        });
      } catch (error) {
        console.error("Failed to parse saved game state:", error);
        toast({
          title: "Error",
          description: "Failed to load saved game data",
          variant: "destructive",
        });
      }
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem("gameAppState", JSON.stringify(state));
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Create hook for easy context use
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
