import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NavBar from '@/components/NavBar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { getGameById } from '@/data/gamesData';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty } from '@/types';
import GameLoader from './GameLoader';
import HowToPlayContentProvider from './HowToPlayContentProvider';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import GameSettingsModal from './GameSettingsModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Key for Player 2's preferred name in local storage
const PREFERRED_PLAYER2_NAME_KEY = 'playPalArcade_preferredPlayer2Name';

// Helper to safely access localStorage
const safeLocalStorageGet = (key: string): string | null => {
  try {
    // Ensure localStorage is available (it might not be in some environments like server-side rendering or private browsing)
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  } catch (e) {
    console.warn("localStorage access denied or unavailable.", e);
    return null;
  }
};

const GameWrapper: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useGameContext();
  const game = gameId ? getGameById(gameId) : null;
  
  // Initialize difficulty state. Fallback to context's difficulty if game is not yet loaded,
  // then useEffect will set it to the game's default.
  const [difficulty, setDifficulty] = React.useState<GameDifficulty>(
    game ? game.defaultDifficulty : state.gameSettings.difficulty
  );
  const [isMultiplayer, setIsMultiplayer] = React.useState<boolean>(
    state.gameSettings.isMultiplayer
  );
  const [player1Name, setPlayer1Name] = React.useState<string>("");
  const [player2Name, setPlayer2Name] = React.useState<string>("");

  // Effect to set initial difficulty and multiplayer status when game changes
  useEffect(() => {
    if (game) {
      // Set difficulty from game's default
      const gameDefaultDifficulty = game.defaultDifficulty;
      setDifficulty(gameDefaultDifficulty);
      dispatch({ type: 'SET_DIFFICULTY', payload: gameDefaultDifficulty });

      // Set multiplayer based on game support and context, defaulting to false if not supported
      const initialMultiplayer = game.supportsMultiplayer ? state.gameSettings.isMultiplayer : false;
      setIsMultiplayer(initialMultiplayer);
      dispatch({ type: 'SET_MULTIPLAYER', payload: initialMultiplayer});

    }
  }, [game, dispatch, state.gameSettings.isMultiplayer]); // Added state.gameSettings.isMultiplayer

  // Effect to initialize Player names
  useEffect(() => {
    if (state.activeProfileId) {
      const currentProfile = state.profiles.find(p => p.id === state.activeProfileId);
      if (currentProfile) {
        setPlayer1Name(currentProfile.name);
      } else {
        setPlayer1Name("Player 1"); // Fallback
      }
    } else {
      setPlayer1Name("Player 1"); // Fallback if no active profile
    }

    // Initialize Player 2 Name based on multiplayer status and localStorage.
    // Game components (like TicTacToe, Nim) will typically set the actual player 2 name
    // to "AI" in single-player mode. This state is primarily for the GameSettingsModal
    // input and for passing to games that might use it directly in multiplayer.
    if (game?.supportsMultiplayer && isMultiplayer) {
      const storedP2Name = safeLocalStorageGet(PREFERRED_PLAYER2_NAME_KEY);
      setPlayer2Name(storedP2Name || "Player 2");
    } else {
      // If not multiplayer or game doesn't support it, P2 name input isn't shown in modal.
      setPlayer2Name("Player 2"); // Default placeholder
    }
  }, [state.activeProfileId, state.profiles, isMultiplayer, game]); // Added isMultiplayer and game

  const toggleSound = () => {
    dispatch({ type: "TOGGLE_SOUND", payload: !state.soundEnabled });
  };
  
  // Restart game function - to be connected to individual games
  const restartGame = () => {
    // This will be handled by individual game components
    // We could implement an event-based system later
  };
  
  if (!game) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Game not found</h1>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }
  
  const handleDifficultyChange = (newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
    dispatch({ type: 'SET_DIFFICULTY', payload: newDifficulty });
  };
  
  const handleMultiplayerChange = (newMultiplayer: boolean) => {
    setIsMultiplayer(newMultiplayer);
    dispatch({ type: 'SET_MULTIPLAYER', payload: newMultiplayer });
    // If switching to single player, P2 name might not be relevant for input
    // If switching to multiplayer, ensure P2 name is loaded or defaulted
    if (newMultiplayer && game?.supportsMultiplayer) {
        const storedP2Name = safeLocalStorageGet(PREFERRED_PLAYER2_NAME_KEY);
        setPlayer2Name(storedP2Name || "Player 2");
    }
  };
  
  return (
    <div className="flex flex-col bg-background overflow-hidden min-h-screen">
      <NavBar />
      <main className="flex-1 container mx-auto p-4 flex flex-col pb-8 md:pb-12">
        <div className="mb-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            <Button variant="outline" size="icon" className="mr-4 h-10 w-10" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{game.name}</h1>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <SettingsIcon className="h-5 w-5" />
                <span className="sr-only">Game Settings & Info</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <GameSettingsModal
                game={game}
                difficulty={difficulty}
                isMultiplayer={isMultiplayer} // This is the current game mode
                soundEnabled={state.soundEnabled}
                onDifficultyChange={handleDifficultyChange}
                onMultiplayerChange={handleMultiplayerChange}
                onSoundToggle={toggleSound}
                howToPlayContent={gameId ? <HowToPlayContentProvider gameId={gameId} /> : null}
                player1Name={player1Name}
                onPlayer1NameChange={setPlayer1Name}
                player2Name={player2Name}
                onPlayer2NameChange={setPlayer2Name}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* The Card component hosts the actual game.
            - flex-grow: Allows it to take up available space in the main content area.
            - flex flex-col: Lays out its children (the game) vertically.
            - min-h-0: Crucial for allowing this Card to shrink below its content's intrinsic height. This prevents the game (which might be h-full) from pushing the Card and subsequently the 'main' element to be too tall, thus avoiding page scrollbars. */}
        <Card className="p-0 overflow-hidden flex-grow flex flex-col min-h-0 max-h-fit"> 
          {gameId && <GameLoader gameId={gameId} player1Name={player1Name} player2Name={player2Name} isMultiplayer={isMultiplayer} />}
        </Card>
      </main>
    </div>
  );
};

export default GameWrapper;
