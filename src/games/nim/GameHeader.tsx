
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react'; // Import HelpCircle
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import GameInstructions from './GameInstructions'; // To display inside the dialog

interface GameHeaderProps {
  onRestart: () => void;
  // onToggleInstructions is no longer needed here as the dialog handles its own state
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
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <HelpCircle className="mr-1 h-4 w-4" />
                How to Play
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>How to Play Nim</DialogTitle>
              </DialogHeader>
              {/* GameInstructions will be rendered here. It might need adjustments. */}
              <GameInstructions />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Got it!</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;

