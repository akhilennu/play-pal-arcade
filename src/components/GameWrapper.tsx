
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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Users, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { getGameById } from '@/data/gamesData';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty } from '@/types';
import GameLoading from './GameLoading';

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
  
  // Get current game settings
  const [difficulty, setDifficulty] = React.useState<GameDifficulty>(
    state.gameSettings.difficulty
  );
  const [isMultiplayer, setIsMultiplayer] = React.useState<boolean>(
    state.gameSettings.isMultiplayer
  );
  
  // Sound toggle
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
  
  const handleDifficultyChange = (value: string) => {
    const newDifficulty = value as GameDifficulty;
    setDifficulty(newDifficulty);
    dispatch({ type: 'SET_DIFFICULTY', payload: newDifficulty });
  };
  
  const handleMultiplayerChange = (value: string) => {
    const newMultiplayer = value === 'true';
    setIsMultiplayer(newMultiplayer);
    dispatch({ type: 'SET_MULTIPLAYER', payload: newMultiplayer });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container p-4">
        <div className="mb-6 flex items-center">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{game.name}</h1>
            <p className="text-muted-foreground text-sm">{game.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game settings sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Game Settings</h3>
                
                {/* Difficulty selector */}
                {game.availableDifficulties.length > 1 && (
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-1 block">
                      Difficulty
                    </label>
                    <Select 
                      value={difficulty} 
                      onValueChange={handleDifficultyChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {game.availableDifficulties.map((diff) => (
                          <SelectItem key={diff} value={diff}>
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Multiplayer toggle */}
                {game.supportsMultiplayer && (
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-1 block">
                      Game Mode
                    </label>
                    <Select
                      value={isMultiplayer ? 'true' : 'false'}
                      onValueChange={handleMultiplayerChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Single Player
                          </div>
                        </SelectItem>
                        <SelectItem value="true">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Multiplayer
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sound Toggle */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block">
                    Sound Effects
                  </label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={toggleSound}
                  >
                    {state.soundEnabled ? (
                      <><Volume2 className="mr-2 h-4 w-4" /> Enabled</>
                    ) : (
                      <><VolumeX className="mr-2 h-4 w-4" /> Disabled</>
                    )}
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                {/* Game info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge variant="outline">{game.category}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Multiplayer</span>
                    <Badge variant={game.supportsMultiplayer ? "default" : "outline"}>
                      {game.supportsMultiplayer ? "Supported" : "Not supported"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Game area */}
          <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden h-[70vh]">
              <Suspense fallback={<GameLoading />}>
                <GameLoader gameId={game.id} />
              </Suspense>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameWrapper;
