
import React, { Suspense, lazy } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { getGameById } from '@/data/gamesData';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty } from '@/types';
import GameLoading from './GameLoading';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import GameSettingsModal from './GameSettingsModal';

// Lazy load games - FIXED: Using correct dynamic imports
const TicTacToe = lazy(() => import('@/games/TicTacToe'));
const MemoryMatch = lazy(() => import('@/games/MemoryMatch'));
const Game2048 = lazy(() => import('@/games/Game2048'));
const NimGame = lazy(() => import('@/games/NimGame'));
const ComingSoon = lazy(() => import('@/components/ComingSoon'));

// Import instruction components
const GameInstructionsNim = lazy(() => import('@/games/nim/GameInstructions'));
const GameInstructionsTicTacToe = lazy(() => import('@/games/tictactoe/GameInstructions'));
const GameInstructionsMemoryMatch = lazy(() => import('@/games/memorymatch/GameInstructions'));
const GameInstructions2048 = lazy(() => import('@/games/game2048/GameInstructions'));

const GameLoader: React.FC<{ gameId: string }> = ({ gameId }) => {
  const gameData = getGameById(gameId);
  
  // Fix: Don't rely on component property, directly use gameId to determine which game to load
  switch (gameId) {
    case 'tictactoe':
      return <TicTacToe />;
    case 'memorymatch':
      return <MemoryMatch />;
    case 'game2048':
      return <Game2048 />;
    case 'nim':
      return <NimGame />;
    case 'hangman':
    case 'connectfour':
    case 'sudoku':
      return <ComingSoon />;
    default:
      return <ComingSoon />;
  }
};

const HowToPlayContentProvider: React.FC<{ gameId: string }> = ({ gameId }) => {
  switch (gameId) {
    case 'nim':
      return <Suspense fallback={<div>Loading instructions...</div>}><GameInstructionsNim /></Suspense>;
    case 'tictactoe':
      return <Suspense fallback={<div>Loading instructions...</div>}><GameInstructionsTicTacToe /></Suspense>;
    case 'memorymatch':
      return <Suspense fallback={<div>Loading instructions...</div>}><GameInstructionsMemoryMatch /></Suspense>;
    case 'game2048':
      return <Suspense fallback={<div>Loading instructions...</div>}><GameInstructions2048 /></Suspense>;
    case 'hangman': // Placeholder for Hangman
      return <p className="italic text-muted-foreground">Detailed instructions for Hangman are coming soon!</p>;
    case 'connectfour': // Placeholder for Connect Four
      return <p className="italic text-muted-foreground">Detailed instructions for Connect Four are coming soon!</p>;
    // Sudoku is isAvailable:false, so it won't typically reach here unless directly navigated to.
    // We can add a case for it if needed, or rely on the default.
    default:
      return <p className="italic text-muted-foreground">Detailed instructions for this game are coming soon!</p>;
  }
};

const GameWrapper: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useGameContext();
  const game = gameId ? getGameById(gameId) : null;
  
  const [difficulty, setDifficulty] = React.useState<GameDifficulty>(
    state.gameSettings.difficulty
  );
  const [isMultiplayer, setIsMultiplayer] = React.useState<boolean>(
    state.gameSettings.isMultiplayer
  );
  
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
  };
  
  return (
    <div className="flex flex-col bg-background overflow-hidden">
      <NavBar />
      <main className="flex-1 container mx-auto p-4 flex flex-col">
        <div className="mb-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            <Button variant="outline" size="icon" className="mr-4 h-10 w-10" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{game.name}</h1>
              {/* Game description is now in the modal, so removed from here if it existed */}
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
                isMultiplayer={isMultiplayer}
                soundEnabled={state.soundEnabled}
                onDifficultyChange={handleDifficultyChange}
                onMultiplayerChange={handleMultiplayerChange}
                onSoundToggle={toggleSound}
                howToPlayContent={<HowToPlayContentProvider gameId={game.id} />}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* The Card component hosts the actual game.
            - flex-grow: Allows it to take up available space in the main content area.
            - flex flex-col: Lays out its children (the game) vertically.
            - min-h-0: Crucial for allowing this Card to shrink below its content's intrinsic height. This prevents the game (which might be h-full) from pushing the Card and subsequently the 'main' element to be too tall, thus avoiding page scrollbars. */}
        <Card className="p-0 overflow-hidden flex-grow flex flex-col min-h-0 max-h-fit"> 
          <Suspense fallback={<GameLoading />}>
            {gameId && <GameLoader gameId={gameId} />}
          </Suspense>
        </Card>
      </main>
    </div>
  );
};

export default GameWrapper;
