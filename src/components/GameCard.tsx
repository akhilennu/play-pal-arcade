
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grid2X2, ListCheck, Plus, HelpCircle, User, Users } from 'lucide-react';
import { Game } from '@/types';
import { useGameContext } from '@/contexts/GameContext';
import { toast } from '@/hooks/use-toast'; // Corrected import path for toast
// Removed useIsMobile as it's not directly used in this simplified card view

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigate = useNavigate();
  const { dispatch } = useGameContext();
  
  const handlePlayClick = () => {
    if (!game.isAvailable) {
      toast({
        title: "Coming Soon!",
        description: "This game is currently in development and will be available soon.",
        variant: "default", // ensure toast has a variant
      });
      return;
    }
    
    dispatch({ type: "SET_CURRENT_GAME", payload: game.id });
    navigate(`/game/${game.id}`);
  };
  
  const getGameIcon = () => {
    const iconProps = { className: "h-5 w-5 md:h-6 md:w-6" }; // responsive icon size
    switch (game.icon) {
      case 'grid-2x2': return <Grid2X2 {...iconProps} />;
      case 'square-check': return <ListCheck {...iconProps} />;
      case 'plus': return <Plus {...iconProps} />;
      default: return <HelpCircle {...iconProps} />;
    }
  };
  
  const isComingSoon = !game.isAvailable;
  
  return (
    <Card className={`overflow-hidden flex flex-col
      transition-all duration-200 ease-in-out 
      ${isComingSoon 
        ? 'opacity-60 shadow-md' 
        : 'shadow-lg hover:shadow-xl active:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
      } rounded-xl border-border/80 bg-card/90 backdrop-blur-sm`} // Added rounded-xl and some transparency
    >
      <CardHeader className="p-4 md:p-5 bg-transparent"> {/* Adjusted padding */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2.5 rounded-lg bg-muted"> {/* Slightly larger padding for icon bg */}
                {getGameIcon()}
              </span>
              <CardTitle className="text-lg md:text-xl leading-tight">{game.name}</CardTitle>
            </div>
            <CardDescription className="text-xs md:text-sm line-clamp-2">{game.description}</CardDescription>
          </div>
          {isComingSoon && (
            <Badge variant="outline" className="text-xs mt-1 whitespace-nowrap border-dashed">
              Coming Soon
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-5 pt-0 flex-grow"> {/* Adjusted padding */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {game.supportsMultiplayer ? (
            <Badge className="flex items-center gap-1 px-2.5 py-1 bg-ocean-blue text-white rounded-full"> {/* Colorful badge */}
              <Users className="h-3.5 w-3.5" />
              Multiplayer
            </Badge>
          ) : (
            <Badge className="flex items-center gap-1 px-2.5 py-1 bg-gray-400 text-white rounded-full"> {/* Neutral single player badge */}
              <User className="h-3.5 w-3.5" />
              Single Player
            </Badge>
          )}
          <Badge className="flex items-center gap-1 px-2.5 py-1 bg-vivid-purple text-white rounded-full"> {/* Colorful badge */}
            {game.availableDifficulties.length} {game.availableDifficulties.length === 1 ? 'difficulty' : 'difficulties'}
          </Badge>
          <Badge variant="outline" className="px-2.5 py-1 rounded-full text-muted-foreground">{game.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-3 md:p-4 mt-auto bg-muted/30"> {/* Adjusted padding and mt-auto */}
        <Button 
          variant={isComingSoon ? "outline" : "default"}
          className={`w-full py-3 text-sm md:text-base font-semibold rounded-lg transition-transform active:scale-95
            ${isComingSoon ? "cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
          onClick={handlePlayClick}
          size="lg" // Using size prop for consistent padding
        >
          {isComingSoon ? "Coming Soon" : "Play Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;

