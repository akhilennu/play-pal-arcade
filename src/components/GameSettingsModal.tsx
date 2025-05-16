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
import { User, Users, Volume2, VolumeX } from 'lucide-react';
import { GameDifficulty, Game } from '@/types'; // Corrected import for Game type

interface GameSettingsModalProps {
  game: Game | null;
  difficulty: GameDifficulty;
  isMultiplayer: boolean;
  soundEnabled: boolean;
  onDifficultyChange: (value: GameDifficulty) => void;
  onMultiplayerChange: (value: boolean) => void;
  onSoundToggle: () => void;
}

const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  game,
  difficulty,
  isMultiplayer,
  soundEnabled,
  onDifficultyChange,
  onMultiplayerChange,
  onSoundToggle,
}) => {
  if (!game) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{game.name} Settings</DialogTitle>
        <DialogDescription>
          Adjust the game settings below. Changes will be applied immediately.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
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
