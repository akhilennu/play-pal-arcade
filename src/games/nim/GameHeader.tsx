
import React from 'react';
import { Button } from '@/components/ui/button';

interface GameHeaderProps {
  onRestart: () => void;
  onToggleInstructions: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  onRestart,
  onToggleInstructions
}) => {
  return (
    <div className="mb-4 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Nim</h2>
        <p className="text-sm text-muted-foreground">
          Strategic pile game - remove objects to win!
        </p>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <div className="flex gap-2">
          <Button onClick={onRestart} size="sm" variant="outline">Restart</Button>
          <Button onClick={onToggleInstructions} size="sm" variant="outline">
            Help
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
