
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const GameLoading: React.FC = () => {
  const [isLongLoad, setIsLongLoad] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If loading takes too long, show additional message
    const longLoadTimeout = setTimeout(() => {
      setIsLongLoad(true);
    }, 5000);

    // If loading takes extremely long, assume there's an error
    const errorTimeout = setTimeout(() => {
      setLoadError(true);
    }, 15000);

    return () => {
      clearTimeout(longLoadTimeout);
      clearTimeout(errorTimeout);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-card">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium animate-pulse">Loading game...</p>
      <p className="text-muted-foreground text-sm mt-2">This should only take a moment</p>
      
      {isLongLoad && !loadError && (
        <div className="mt-8 text-center">
          <p className="text-amber-500 dark:text-amber-400">Taking longer than expected...</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait a bit longer</p>
        </div>
      )}

      {loadError && (
        <div className="mt-8 text-center">
          <p className="text-destructive font-medium mb-2">
            There was an error loading the game
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={handleGoHome}>
              Go Home
            </Button>
            <Button onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLoading;
