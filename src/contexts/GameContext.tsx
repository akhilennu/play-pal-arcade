import React, { createContext, useContext, useReducer, useEffect } from "react";
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

const initialCoreState: Omit<GameState, 'profiles' | 'activeProfileId' | 'scores'> = {
  currentGame: null,
  gameSettings: {
    difficulty: GameDifficulty.MEDIUM,
    isMultiplayer: false,
  },
  achievements: [],
  soundEnabled: true,
  musicEnabled: true,
  theme: "system",
};

const initialUserState = {
  profiles: [],
  activeProfileId: null,
  scores: [],
};

const initialState: GameState = {
  ...initialCoreState,
  ...initialUserState,
};

// Define actions
type GameAction =
  | { type: "SET_CURRENT_GAME"; payload: string | null }
  | { type: "SET_DIFFICULTY"; payload: GameDifficulty }
  | { type: "SET_MULTIPLAYER"; payload: boolean }
  | { type: "ADD_PROFILE"; payload: UserProfile }
  | { type: "SET_ACTIVE_PROFILE"; payload: string | null }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> & { id: string } }
  | { type: "ADD_SCORE"; payload: Score }
  | { type: "UNLOCK_ACHIEVEMENT"; payload: { profileId: string; achievementId: string } }
  | { type: "TOGGLE_SOUND"; payload: boolean }
  | { type: "TOGGLE_MUSIC"; payload: boolean }
  | { type: "SET_THEME"; payload: "light" | "dark" | "system" }
  | { type: "RESET_USER_DATA" }
  | { type: "SET_PROFILES"; payload: UserProfile[] }
  | { type: "SET_SCORES"; payload: Score[] }
  | { type: "SET_ACHIEVEMENTS"; payload: Achievement[] };

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
    case "RESET_USER_DATA":
      return {
        ...state,
        profiles: [],
        activeProfileId: null,
        scores: [],
      };
    case "SET_PROFILES":
      return { ...state, profiles: action.payload };
    case "SET_SCORES":
      return { ...state, scores: action.payload };
    case "SET_ACHIEVEMENTS":
      return { ...state, achievements: action.payload };
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

  useEffect(() => {
    const savedStateString = localStorage.getItem("gameAppState");
    if (savedStateString) {
      try {
        const savedState = JSON.parse(savedStateString) as Partial<GameState>;
        
        // Create a full state object to dispatch, ensuring all keys are present
        const fullLoadedState: GameState = { ...initialState, ...savedState };

        // Convert date strings back to Date objects more robustly
        const parseDates = (profiles: UserProfile[] | undefined, scores: Score[] | undefined) => {
          const parsedProfiles = profiles?.map(profile => ({
            ...profile,
            createdAt: profile.createdAt ? new Date(profile.createdAt) : new Date(),
            achievements: profile.achievements?.map(a => ({
              ...a,
              unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
            })) || [],
          })) || [];

          const parsedScores = scores?.map(score => ({
            ...score,
            date: score.date ? new Date(score.date) : new Date(),
          })) || [];
          return { parsedProfiles, parsedScores };
        };

        const { parsedProfiles, parsedScores } = parseDates(savedState.profiles, savedState.scores);

        // Dispatch individual actions to populate the state
        // This ensures the reducer logic is respected for each piece of state
        if (parsedProfiles) dispatch({ type: "SET_PROFILES", payload: parsedProfiles });
        if (parsedScores) dispatch({ type: "SET_SCORES", payload: parsedScores });
        if (savedState.activeProfileId !== undefined) dispatch({ type: "SET_ACTIVE_PROFILE", payload: savedState.activeProfileId });
        if (savedState.gameSettings) {
            if (savedState.gameSettings.difficulty) dispatch({ type: "SET_DIFFICULTY", payload: savedState.gameSettings.difficulty });
            if (savedState.gameSettings.isMultiplayer !== undefined) dispatch({ type: "SET_MULTIPLAYER", payload: savedState.gameSettings.isMultiplayer });
        }
        if (savedState.currentGame !== undefined) dispatch({ type: "SET_CURRENT_GAME", payload: savedState.currentGame });
        if (savedState.soundEnabled !== undefined) dispatch({ type: "TOGGLE_SOUND", payload: savedState.soundEnabled });
        if (savedState.musicEnabled !== undefined) dispatch({ type: "TOGGLE_MUSIC", payload: savedState.musicEnabled });
        if (savedState.theme) dispatch({ type: "SET_THEME", payload: savedState.theme });
        if (savedState.achievements) dispatch({ type: "SET_ACHIEVEMENTS", payload: savedState.achievements });

      } catch (error) {
        console.error("Failed to parse or apply saved game state:", error);
        toast({
          title: "Error",
          description: "Failed to load saved game data. Resetting to defaults.",
          variant: "destructive",
        });
        // Optionally clear corrupted local storage
        localStorage.removeItem("gameAppState");
      }
    }
  }, [toast]);

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
