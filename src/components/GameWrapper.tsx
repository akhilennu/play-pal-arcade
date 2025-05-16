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

// Lazy load games
const TicTacToe = lazy(() => import('@/games/TicTacToe'));
const MemoryMatch = lazy(() => import('@/games/MemoryMatch'));
const Game2048 = lazy(() => import('@/games/Game2048'));
const NimGame = lazy(() => import('@/games/NimGame'));
const ComingSoon = lazy(() => import('@/components/ComingSoon'));

const GameLoader: React.FC<{ gameId: string }> = ({ gameId }) => {
  switch (gameId) {
    case 'tictactoe':
      return <TicTacToe />;
    case 'memorymatch':
      return <MemoryMatch />;
    case 'game2048':
      return <Game2048 />;
    case 'nim':
      return <NimGame />;
    default:
      return <ComingSoon />;
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
      <div className="min-h-screen flex flex-col">
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
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container p-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{game.name}</h1>
              <p className="text-muted-foreground text-sm">{game.description}</p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <SettingsIcon className="h-5 w-5" />
                <span className="sr-only">Game Settings & Info</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <GameSettingsModal
                game={game}
                difficulty={difficulty}
                isMultiplayer={isMultiplayer}
                soundEnabled={state.soundEnabled}
                onDifficultyChange={handleDifficultyChange}
                onMultiplayerChange={handleMultiplayerChange}
                onSoundToggle={toggleSound}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Game area (now takes full width available in the grid) */}
        {/* The grid is removed as the sidebar is gone, game takes full width */}
        <Card className="p-0 overflow-auto h-[calc(100vh-220px)] sm:h-[calc(100vh-200px)]"> {/* Adjusted height */}
          <Suspense fallback={<GameLoading />}>
            <GameLoader gameId={game.id} />
          </Suspense>
        </Card>
      </main>
    </div>
  );
};

export default GameWrapper;
