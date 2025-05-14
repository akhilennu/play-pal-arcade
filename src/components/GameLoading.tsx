
import React from "react";
import { Loader2 } from "lucide-react";

const GameLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-card">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium animate-pulse">Loading game...</p>
      <p className="text-muted-foreground text-sm mt-2">This should only take a moment</p>
    </div>
  );
};

export default GameLoading;
