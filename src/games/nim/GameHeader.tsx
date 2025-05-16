
import React from 'react';
import { Button } from '@/components/ui/button';
// HelpCircle, Dialog components are no longer needed here if we remove the specific "How to Play" dialog
// import { HelpCircle } from 'lucide-react'; 
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog";
// import GameInstructions from './GameInstructions'; // No longer rendered directly here

interface GameHeaderProps {
  onRestart: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  onRestart,
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
          {/* The "How to Play" button and its Dialog has been removed. */}
          {/* Instructions are now in the main settings modal accessed from GameWrapper. */}
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
