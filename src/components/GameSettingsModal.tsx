import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { User, Users, Volume2, VolumeX, Info, Puzzle, Users2, ShieldQuestion, HelpCircle } from 'lucide-react'; // Added HelpCircle
import { GameDifficulty, Game } from '@/types';
import { Badge } from '@/components/ui/badge';

interface GameSettingsModalProps {
  game: Game | null;
  difficulty: GameDifficulty;
  isMultiplayer: boolean;
  soundEnabled: boolean;
  onDifficultyChange: (value: GameDifficulty) => void;
  onMultiplayerChange: (value: boolean) => void;
  onSoundToggle: () => void;
  howToPlayContent?: React.ReactNode; // New prop
}

const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  game,
  difficulty,
  isMultiplayer,
  soundEnabled,
  onDifficultyChange,
  onMultiplayerChange,
  onSoundToggle,
  howToPlayContent, // Destructure new prop
}) => {
  if (!game) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{game.name} Settings & Info</DialogTitle>
        <DialogDescription>
          Adjust game settings or view game information. Changes are applied immediately.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4 space-y-6">
        {/* Game Information Section (metadata) */}
        <div>
          <h4 className="text-md font-medium mb-2 flex items-center">
            <Info className="mr-2 h-5 w-5 text-primary" />
            Game Information
          </h4>
          <div className="space-y-1 text-sm pl-2 border-l-2 border-muted">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center"><Puzzle className="mr-1.5 h-4 w-4"/>Category:</span>
              <Badge variant="outline">{game.category.charAt(0).toUpperCase() + game.category.slice(1)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center"><Users2 className="mr-1.5 h-4 w-4"/>Multiplayer:</span>
              <Badge variant={game.supportsMultiplayer ? "secondary" : "outline"}>
                {game.supportsMultiplayer ? "Supported" : "Single Player"}
              </Badge>
            </div>
            {game.availableDifficulties.length === 1 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><ShieldQuestion className="mr-1.5 h-4 w-4"/>Default Difficulty:</span>
                <Badge variant="outline">
                  {game.availableDifficulties[0].charAt(0).toUpperCase() + game.availableDifficulties[0].slice(1)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* How to Play Section */}
        {howToPlayContent && (
          <div>
            <h4 className="text-md font-medium mb-2 flex items-center">
              <HelpCircle className="mr-2 h-5 w-5 text-primary" />
              How to Play
            </h4>
            <div className="text-sm pl-2 border-l-2 border-muted prose prose-sm dark:prose-invert max-w-none">
              {howToPlayContent}
            </div>
          </div>
        )}

        {/* Difficulty selector */}
        {game.availableDifficulties.length > 1 && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Difficulty
            </label>
            <Select
              value={difficulty}
              onValueChange={(value) => onDifficultyChange(value as GameDifficulty)}
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
          <div>
            <label className="text-sm font-medium mb-1 block">
              Game Mode
            </label>
            <Select
              value={isMultiplayer ? 'true' : 'false'}
              onValueChange={(value) => onMultiplayerChange(value === 'true')}
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
        <div>
          <label className="text-sm font-medium mb-1 block">
            Sound Effects
          </label>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={onSoundToggle}
          >
            {soundEnabled ? (
              <><Volume2 className="mr-2 h-4 w-4" /> Enabled</>
            ) : (
              <><VolumeX className="mr-2 h-4 w-4" /> Disabled</>
            )}
          </Button>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};

export default GameSettingsModal;
