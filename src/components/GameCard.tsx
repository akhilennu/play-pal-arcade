
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
  
  const getCategoryBadgeStyle = (category: string): string => {
    const lowerCategory = category.toLowerCase();
    switch (lowerCategory) {
      case 'classic':
        return 'bg-[#A9A9A9] text-white dark:bg-[#777777] dark:text-white'; // DarkGray
      case 'puzzle':
        return 'bg-[#E6E6FA] text-black dark:bg-[#B0A0E0] dark:text-white'; // Lavender / Darker Lavender
      case 'strategy':
        return 'bg-[#8FBC8F] text-black dark:bg-[#6A9E6A] dark:text-white'; // Seafoam Green / Darker Seafoam
      // Add more cases for other categories as needed
      default:
        return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'; // Default neutral
    }
  };

  return (
    <Card className={`overflow-hidden flex flex-col
      transition-all duration-200 ease-in-out 
      ${isComingSoon 
        ? 'opacity-60 shadow-md' 
        : 'shadow-lg hover:shadow-xl active:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-[#008080] dark:hover:border-[#4DB6AC]'
      } rounded-xl border-border/80 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-sm`}
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
            <Badge className="flex items-center gap-1 px-2.5 py-1 bg-[#00FFFF] text-black dark:bg-[#40E0D0] dark:text-black rounded-full"> {/* Vibrant Cyan Accent */}
              <Users className="h-3.5 w-3.5" />
              Multiplayer
            </Badge>
          ) : (
            // Soft Orange for Single Player
            <Badge className="flex items-center gap-1 px-2.5 py-1 bg-[#FFB347] text-black dark:bg-[#E69500] dark:text-black rounded-full">
              <User className="h-3.5 w-3.5" />
              Single Player
            </Badge>
          )}
          {/* Amethyst Purple for Difficulties */}
          <Badge className="flex items-center gap-1 px-2.5 py-1 bg-[#9400D3] text-white dark:bg-[#8A2BE2] dark:text-white rounded-full">
            {game.availableDifficulties.length} {game.availableDifficulties.length === 1 ? 'difficulty' : 'difficulties'}
          </Badge>
          {/* Dynamically styled Category Badge */}
          <Badge className={`px-2.5 py-1 rounded-full ${getCategoryBadgeStyle(game.category)}`}>{game.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-3 md:p-4 mt-auto bg-muted/30"> {/* Adjusted padding and mt-auto */}
        <Button 
          variant={isComingSoon ? "outline" : "default"}
          className={`w-full py-3 text-sm md:text-base font-semibold rounded-lg transition-transform active:scale-95
            ${isComingSoon 
              ? "cursor-not-allowed" 
              : "bg-[#00ACC1] hover:bg-[#008C9E] dark:bg-[#26C6DA] dark:hover:bg-[#1E9FB0] text-white" // Brighter Teal Blue for Play Now button
            }`}
          onClick={handlePlayClick}
          size="lg"
        >
          {isComingSoon ? "Coming Soon" : "Play Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
